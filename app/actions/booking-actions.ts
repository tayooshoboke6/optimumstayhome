"use server"

import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { z } from "zod"
import nodemailer from "nodemailer"
import { generateBookingId } from "@/lib/booking-utils"

// Validation schema
const bookingSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  checkIn: z.date({ required_error: "Please select a check-in date." }),
  checkOut: z.date({ required_error: "Please select a check-out date." }),
  guests: z.string().min(1, { message: "Please enter the number of guests." }),
  specialRequests: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function submitBooking(formData: BookingFormData) {
  try {
    // Validate form data
    const validatedData = bookingSchema.parse(formData)

    // Generate a user-friendly booking ID
    const bookingId = generateBookingId()

    // Add booking to Firestore
    const bookingRef = await addDoc(collection(db, "bookings"), {
      ...validatedData,
      checkIn: validatedData.checkIn.toISOString(),
      checkOut: validatedData.checkOut.toISOString(),
      status: "pending",
      createdAt: serverTimestamp(),
      bookingId: bookingId, // Store the user-friendly ID
    })

    // Send confirmation email to guest
    await sendGuestConfirmationEmail(validatedData, bookingRef.id, bookingId)

    // Send notification email to admin
    await sendAdminNotificationEmail(validatedData, bookingRef.id, bookingId)

    return {
      success: true,
      message: "Booking request submitted successfully",
      bookingId: bookingId,
      docId: bookingRef.id,
    }
  } catch (error) {
    console.error("Error submitting booking:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Update the email functions to include the bookingId
async function sendGuestConfirmationEmail(booking: BookingFormData, docId: string, bookingId: string) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/optimum-stay-logo-removebg-preview.png" alt="Optimum Stay Homes" style="max-width: 220px;">
      </div>
      
      <h2 style="color: #E9A23B; text-align: center;">Booking Request Received</h2>
      
      <p>Dear ${booking.name},</p>
      
      <p>Thank you for choosing Optimum Stay Homes for your upcoming stay. We have received your booking request and are reviewing it.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString()}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
      </div>
      
      <p>You can view your booking details at any time by visiting:</p>
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking-status?id=${bookingId}" 
           style="background-color: #E9A23B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Booking
        </a>
      </p>
      
      <p>We will review your booking request and send you a confirmation email shortly. If you have any questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>Optimum Stay Homes Team</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Optimum Stay Homes" <${process.env.EMAIL_FROM}>`,
      to: booking.email,
      subject: "Your Booking Request at Optimum Stay Homes",
      html: emailContent,
    })
  } catch (error) {
    console.error("Error sending guest confirmation email:", error)
  }
}

async function sendAdminNotificationEmail(booking: BookingFormData, docId: string, bookingId: string) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E9A23B;">New Booking Request</h2>
      
      <p>A new booking request has been submitted.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details:</h3>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Guest:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Check-in:</strong> ${booking.checkIn.toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${booking.checkOut.toLocaleDateString()}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ""}
      </div>
      
      <p>Please log in to the admin dashboard to review and confirm this booking:</p>
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" 
           style="background-color: #E9A23B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Optimum Stay Homes" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: "New Booking Request - Optimum Stay Homes",
      html: emailContent,
    })
  } catch (error) {
    console.error("Error sending admin notification email:", error)
  }
}
