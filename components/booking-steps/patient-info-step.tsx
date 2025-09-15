"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { BookingData } from "../appointment-booking-wizard"

interface PatientInfoStepProps {
  data: BookingData
  onUpdate: (updates: Partial<BookingData>) => void
  onNext: () => void
}

export function PatientInfoStep({ data, onUpdate, onNext }: PatientInfoStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">
          อายุคลินิก
        </Label>
        <Input
          id="patientName"
          placeholder="คำใบ่ ใบรสด -"
          value={data.patientName}
          onChange={(e) => onUpdate({ patientName: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">มีการตรวจเลือดไหม</Label>
        <RadioGroup
          value={data.bloodTestBefore}
          onValueChange={(value) => onUpdate({ bloodTestBefore: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="มี" id="blood-yes" />
            <Label htmlFor="blood-yes" className="text-sm">
              มี
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ไม่มี" id="blood-no" />
            <Label htmlFor="blood-no" className="text-sm">
              ไม่มี
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">เจาะเลือดแล้วครั้งไหม</Label>
        <RadioGroup
          value={data.bloodTestAfter}
          onValueChange={(value) => onUpdate({ bloodTestAfter: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="เจาะแล้ว ผลเป็น HIV" id="hiv-positive" />
            <Label htmlFor="hiv-positive" className="text-sm">
              เจาะแล้ว ผลเป็น HIV
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="เจาะแล้ว ผลไม่เป็น HIV" id="hiv-negative" />
            <Label htmlFor="hiv-negative" className="text-sm">
              เจาะแล้ว ผลไม่เป็น HIV
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ยังไม่ได้เจาะ" id="not-tested" />
            <Label htmlFor="not-tested" className="text-sm">
              ยังไม่ได้เจาะ
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">มีประวัติเสี่ยงต่อเอชไอวีใน 5 ปีที่ผ่านมาไหม</Label>
        <RadioGroup
          value={data.hivRiskLast5Years}
          onValueChange={(value) => onUpdate({ hivRiskLast5Years: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="มี" id="risk-yes" />
            <Label htmlFor="risk-yes" className="text-sm">
              มี
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ไม่มี" id="risk-no" />
            <Label htmlFor="risk-no" className="text-sm">
              ไม่มี
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">ผู้ประเมิน HIV หรือไม่</Label>
        <RadioGroup
          value={data.hivTestResult}
          onValueChange={(value) => onUpdate({ hivTestResult: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ใช่" id="hiv-assessed-yes" />
            <Label htmlFor="hiv-assessed-yes" className="text-sm">
              ใช่
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ไม่ใช่" id="hiv-assessed-no" />
            <Label htmlFor="hiv-assessed-no" className="text-sm">
              ไม่ใช่
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          ต่อไป →
        </Button>
      </div>
    </form>
  )
}
