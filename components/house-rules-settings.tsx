"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, PlusCircle, MinusCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HouseRule {
  id: string
  rule: string
}

export function HouseRulesSettings() {
  const [houseRules, setHouseRules] = useState<HouseRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchHouseRules() {
      try {
        setLoading(true)
        const rulesDoc = await getDoc(doc(db, "settings", "houseRules"))
        
        if (rulesDoc.exists()) {
          const data = rulesDoc.data()
          setHouseRules(data.items || [])
        } else {
          // Set default rules if none exist
          setHouseRules([
            { id: "1", rule: "No smoking" },
            { id: "2", rule: "No pets" },
            { id: "3", rule: "No parties or events" },
            { id: "4", rule: "Check-in: After 3:00 PM" },
            { id: "5", rule: "Check-out: Before 11:00 AM" }
          ])
        }
      } catch (error) {
        console.error("Error fetching house rules:", error)
        toast({
          title: "Error",
          description: "Failed to load house rules",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHouseRules()
  }, [])

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...houseRules]
    newRules[index] = {
      ...newRules[index],
      rule: value
    }
    setHouseRules(newRules)
  }

  const handleAddRule = () => {
    const newId = `rule-${Date.now()}`
    setHouseRules([...houseRules, { id: newId, rule: "" }])
  }

  const handleRemoveRule = (index: number) => {
    const newRules = [...houseRules]
    newRules.splice(index, 1)
    setHouseRules(newRules)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validate that all rules have content
      const invalidRules = houseRules.some(r => !r.rule.trim())
      if (invalidRules) {
        toast({
          title: "Invalid Rules",
          description: "All rules must have content",
          variant: "destructive",
        })
        return
      }

      // Save to Firestore
      await setDoc(doc(db, "settings", "houseRules"), {
        items: houseRules,
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Settings Saved",
        description: "House rules have been updated successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Error saving house rules:", error)
      toast({
        title: "Error",
        description: "Failed to save house rules",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>House Rules Settings</CardTitle>
          <CardDescription>Edit the house rules that appear on the homepage</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#E9A23B]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>House Rules Settings</CardTitle>
        <CardDescription>Edit the house rules that appear on the homepage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            {houseRules.map((rule, index) => (
              <div key={rule.id} className="flex items-center gap-2">
                <Input
                  value={rule.rule}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  placeholder="Enter house rule"
                  className="flex-grow"
                />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveRule(index)}
                  disabled={houseRules.length <= 1}
                  className="text-red-500"
                >
                  <MinusCircle className="h-5 w-5" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleAddRule}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#E9A23B] hover:bg-[#d89328] w-full"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save House Rules
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 