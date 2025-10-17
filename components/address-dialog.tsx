"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Pencil, Trash2, Plus } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddressDialog({ open, onOpenChange }: AddressDialogProps) {
  const addresses = useCartStore((state) => state.addresses)
  const addAddress = useCartStore((state) => state.addAddress)
  const updateAddress = useCartStore((state) => state.updateAddress)
  const deleteAddress = useCartStore((state) => state.deleteAddress)

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newAddress, setNewAddress] = useState("")
  const [editAddress, setEditAddress] = useState("")

  const handleAdd = () => {
    if (newAddress.trim()) {
      addAddress(newAddress.trim())
      setNewAddress("")
      setIsAdding(false)
    }
  }

  const handleEdit = (id: string) => {
    if (editAddress.trim()) {
      updateAddress(id, editAddress.trim())
      setEditingId(null)
      setEditAddress("")
    }
  }

  const startEdit = (id: string, address: string) => {
    setEditingId(id)
    setEditAddress(address)
    setIsAdding(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditAddress("")
  }

  const handleDelete = (id: string) => {
    deleteAddress(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">ที่อยู่จัดส่ง</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-3 md:p-4">
              {editingId === address.id ? (
                <div className="space-y-2">
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="กรอกที่อยู่"
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(address.id)}
                      className="bg-amber-600 hover:bg-amber-700 flex-1"
                    >
                      แก้ไข
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1 bg-transparent">
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-sm break-words">{address.address}</div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(address.id, address.address)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(address.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAdding ? (
            <div className="border rounded-lg p-3 md:p-4 space-y-2">
              <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="กรอกที่อยู่" />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} className="bg-green-600 hover:bg-green-700 flex-1">
                  เพิ่ม
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false)
                    setNewAddress("")
                  }}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsAdding(true)
                setEditingId(null)
              }}
              className="w-full border border-dashed rounded-lg p-3 md:p-4 flex items-center justify-center gap-2 text-muted-foreground hover:bg-accent transition-colors"
            >
              <Plus className="h-4 w-4" />
              เพิ่มที่อยู่
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
