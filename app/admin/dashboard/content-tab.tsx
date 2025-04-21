"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApartmentDetailsSettings } from "@/components/apartment-details-settings"
import { AmenitiesSettings } from "@/components/amenities-settings"
import { HouseRulesSettings } from "@/components/house-rules-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ContentTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Content Settings</CardTitle>
        <CardDescription>Manage the content that appears on your homepage</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="apartment" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="apartment">Apartment Details</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="rules">House Rules</TabsTrigger>
          </TabsList>
          
          <TabsContent value="apartment" className="space-y-4">
            <ApartmentDetailsSettings />
          </TabsContent>
          
          <TabsContent value="amenities" className="space-y-4">
            <AmenitiesSettings />
          </TabsContent>
          
          <TabsContent value="rules" className="space-y-4">
            <HouseRulesSettings />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 