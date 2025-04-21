"use server"

import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import nodemailer from "nodemailer"

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

export async function updateBookingStatus(bookingId: string, status: "confirmed" | "rejected", bookingData: any) {
  try {
    // Update booking status in Firestore
    const bookingRef = doc(db, "bookings", bookingId)
    await updateDoc(bookingRef, { status })

    // Send email notification based on status
    if (status === "confirmed") {
      await sendConfirmationEmail(bookingData)
    } else if (status === "rejected") {
      await sendRejectionEmail(bookingData)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error updating booking status to ${status}:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

async function sendConfirmationEmail(booking: any) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E9A23B;">Booking Confirmed!</h2>
      <p>Dear ${booking.name},</p>
      <p>We're pleased to inform you that your booking request at Optimum Stay Homes has been confirmed.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details:</h3>
        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
      </div>
      
      <p>We look forward to welcoming you to our property. If you have any questions before your arrival, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>Optimum Stay Homes Team</p>
    </div>
  `

  await transporter.sendMail({
    from: `"Optimum Stay Homes" <${process.env.EMAIL_FROM}>`,
    to: booking.email,
    subject: "Your Booking at Optimum Stay Homes is Confirmed",
    html: emailContent,
  })
}

async function sendRejectionEmail(booking: any) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E9A23B;">Booking Request Update</h2>
      <p>Dear ${booking.name},</p>
      <p>Thank you for your interest in staying at Optimum Stay Homes.</p>
      <p>Unfortunately, we are unable to accommodate your booking request for the following dates:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
      </div>
      
      <p>This could be due to availability issues or other constraints. We apologize for any inconvenience this may cause.</p>
      <p>Please feel free to check our availability for alternative dates or contact us directly if you have any questions.</p>
      
      <p>Best regards,<br>Optimum Stay Homes Team</p>
    </div>
  `

  await transporter.sendMail({
    from: `"Optimum Stay Homes" <${process.env.EMAIL_FROM}>`,
    to: booking.email,
    subject: "Update on Your Booking Request at Optimum Stay Homes",
    html: emailContent,
  })
}
