"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type OrderStatus = "prepare" | "send" | "completed"

interface Order {
  id: string
  pharmacy: string
  deliveryMethod: string
  deliveryDate: string
  prepareDeadline?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  vat: number
  total: number
  status: OrderStatus
  statusText?: string
}

const mockOrders: Order[] = [
  {
    id: "25690820-666",
    pharmacy: "ร้านโรงพยาบาล",
    deliveryMethod: "คุณร้อยเอ๊ก พเนตร",
    deliveryDate: "สั่งเมื่อ 12 สิงหาคม 2568 00:00 น.",
    items: [
      { name: "ยา KKK", quantity: 1, price: 120 },
      { name: "ยา K", quantity: 1, price: 120 },
    ],
    vat: 999,
    total: 999,
    status: "prepare",
    statusText: "คำสั่งซิตเรียบสินค้า",
  },
  {
    id: "25690820-667",
    pharmacy: "จัดส่งฟรีสุด",
    deliveryMethod: "คุณร้อยเอ๊ก พเนตร",
    deliveryDate: "สั่งเมื่อ 12 สิงหาคม 2568 00:00 น.",
    items: [
      { name: "ยา KKK", quantity: 1, price: 120 },
      { name: "ยา K", quantity: 1, price: 120 },
    ],
    vat: 999,
    total: 999,
    status: "prepare",
    statusText: "คำสั่งซิตเรียบสินค้า",
  },
  {
    id: "25690820-667",
    pharmacy: "จัดส่งฟรีสุด",
    deliveryMethod: "ยายแพทย์เรียร้อง จรพเน",
    deliveryDate: "สั่งเมื่อ 12 สิงหาคม 2568 00:00 น.",
    prepareDeadline: "ยายแพทย์เรียร้อง จรพเน เมื่อ 13 สิงหาคม 2568 00:00 น.",
    items: [
      { name: "ยา KKK", quantity: 1, price: 120 },
      { name: "ยา K", quantity: 1, price: 120 },
    ],
    vat: 999,
    total: 999,
    status: "send",
  },
  {
    id: "25690820-666",
    pharmacy: "ร้านโรงพยาบาล",
    deliveryMethod: "คุณร้อยเอ๊ก พเนตร",
    deliveryDate: "สั่งเมื่อ 12 สิงหาคม 2568 00:00 น.",
    items: [
      { name: "ยา KKK", quantity: 1, price: 120 },
      { name: "ยา K", quantity: 1, price: 120 },
    ],
    vat: 999,
    total: 999,
    status: "completed",
  },
]

export default function MedicineOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("prepare")

  const filteredOrders = mockOrders.filter((order) => order.status === activeTab)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative flex-1 p-4 md:p-8">
          <SidebarTrigger />
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">รายการสั่งยา</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("prepare")}
            className={`rounded-lg px-6 py-3 font-medium transition-colors ${
              activeTab === "prepare" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            ที่ต้องเตรียมการ
          </button>
          <button
            onClick={() => setActiveTab("send")}
            className={`rounded-lg px-6 py-3 font-medium transition-colors ${
              activeTab === "send" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            ที่ต้องส่ง
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`rounded-lg px-6 py-3 font-medium transition-colors ${
              activeTab === "completed" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            สำเร็จ
          </button>
        </div>

        {/* Order Cards */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <Card key={`${order.id}-${index}`} className="bg-white p-6">
              <div className="space-y-4">
                {/* Order Header */}
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">หมายเลขคำสั่งซื้อ</span> {order.id}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">รูปแบบการสั่งซื้อ</span> {order.pharmacy}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">ผู้รับ</span> {order.deliveryMethod} {order.deliveryDate}
                  </p>
                  {order.prepareDeadline && (
                    <p className="text-sm">
                      <span className="font-semibold">เตรียมการเสร็จสิ้นโดย</span> {order.prepareDeadline}
                    </p>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-2 border-t pt-4">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>
                        {item.quantity}x {item.price} บาท
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm">
                    <span>VAT 7%</span>
                    <span>{order.vat} บาท</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>รวมทั้งสิ้น</span>
                    <span>{order.total} บาท</span>
                  </div>
                </div>

                {/* Action Area */}
                <div className="flex items-center justify-between border-t pt-4">
                  {order.status === "prepare" && order.statusText && (
                    <>
                      <p className="text-sm text-green-600">{order.statusText}</p>
                      <Button className="bg-green-600 hover:bg-green-700">เตรียมการสำเร็จ</Button>
                    </>
                  )}
                  {order.status === "send" && order.prepareDeadline && (
                    <>
                      <p className="text-sm text-green-600">เตรียมการเสร็จสิ้น โดย {order.prepareDeadline}</p>
                      <Button className="bg-green-600 hover:bg-green-700">ที่ต้องเผื่นส่ง</Button>
                    </>
                  )}
                  {order.status === "completed" && order.statusText && (
                    <p className="text-sm text-blue-600">เตรียมการสำเร็จ โดยยายแพทย์เรียร้อง จรพเน</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
            </div>
      </SidebarInset>
  </SidebarProvider>
  )
}
