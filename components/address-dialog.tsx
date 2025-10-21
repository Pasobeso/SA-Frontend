"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Pencil, Trash2, Plus, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Deliveries } from "@/lib/api/deliveries"
import { Auth } from "@/lib/api/auth"
import { useAddressStore } from "@/lib/address-store"

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddressDialog({ open, onOpenChange }: AddressDialogProps) {
  const { toast } = useToast()
  const { addresses, fetchAddresses, addAddress } = useAddressStore() // ✅ only one source of truth
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // form fields
  const [recipientName, setRecipientName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [streetAddress, setStreetAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("Thailand")

  // fetch user + addresses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await Auth.getMe()
        const me = userRes.data?.me
        if (me) {
          setUser({
            name: `${me.first_name} ${me.last_name}`,
            phone: me.phone_number || "",
          })
          setRecipientName(`${me.first_name} ${me.last_name}`)
          setPhoneNumber(me.phone_number || "")
        }

        await fetchAddresses() // ✅ only fetch via store
      } catch (err) {
        console.error(err)
        toast({
          title: "โหลดข้อมูลไม่สำเร็จ",
          description: "โปรดลองใหม่อีกครั้ง",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (open) fetchData()
  }, [open, toast, fetchAddresses])


const handleAdd = async () => {
  if (!streetAddress.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
    toast({
      title: "กรุณากรอกข้อมูลให้ครบ",
      description: "กรุณากรอกที่อยู่ เขต จังหวัด และรหัสไปรษณีย์",
      variant: "destructive",
    })
    return
  }

  try {
    const req: Deliveries.CreateDeliveryAddressReq = {
      recipient_name: recipientName || (user?.name ?? "ไม่ระบุชื่อ"),
      phone_number: phoneNumber || (user?.phone ?? "0000000000"),
      street_address: streetAddress,
      city,
      state,
      postal_code: postalCode,
      country,
    }

    await addAddress(req) // ✅ now updates global store
    toast({ title: "เพิ่มที่อยู่สำเร็จ" })

    // reset form fields
    setRecipientName(user?.name ?? "")
    setPhoneNumber(user?.phone ?? "")
    setStreetAddress("")
    setCity("")
    setState("")
    setPostalCode("")
    setIsAdding(false)
  } catch (err) {
    console.error(err)
    toast({
      title: "เพิ่มที่อยู่ไม่สำเร็จ",
      description: "โปรดลองใหม่อีกครั้ง",
      variant: "destructive",
    })
  }
}



  // 🟡 Edit existing address (open editor)
  const startEdit = (address: Deliveries.DeliveryAddressEntity) => {
    setEditingId(address.id)
    setRecipientName(address.recipient_name ?? "")
    setPhoneNumber(address.phone_number ?? "")
    setStreetAddress(address.street_address)
    setCity(address.city)
    setState(address.state)
    setPostalCode(address.postal_code)
    setCountry(address.country ?? "Thailand")
    setIsAdding(false)
  }

  // 🟢 Save edited address (PATCH to backend)
  const handleEditSave = async () => {
    if (editingId === null) return;

    try {
      const updateReq: Partial<Deliveries.CreateDeliveryAddressReq> = {
        recipient_name: recipientName.trim(),
        phone_number: phoneNumber.trim(),
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country: country.trim(),
      };

      console.log("🔹 Sending PATCH:", updateReq);

      const res = await Deliveries.updateAddress(editingId, updateReq);

      // update local list
      useAddressStore.setState((state) => ({
        addresses: state.addresses.map((a) =>
          a.id === editingId ? { ...a, ...res.data } : a
        ),
      }));

      toast({ title: "แก้ไขที่อยู่สำเร็จ" });

      // reset edit state
      setEditingId(null);
      setRecipientName(user?.name ?? "");
      setPhoneNumber(user?.phone ?? "");
      setStreetAddress("");
      setCity("");
      setState("");
      setPostalCode("");
    } catch (err: any) {
      console.error("❌ Update failed:", err);
      toast({
        title: "แก้ไขที่อยู่ไม่สำเร็จ",
        description: "โปรดลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    }
  };


  // 🗑 Delete
const handleDelete = async (id: number) => {
  try {
    await Deliveries.deleteAddress(id)

    // ✅ Update global Zustand store
    useAddressStore.setState((state) => ({
      addresses: state.addresses.filter((a) => a.id !== id),
    }))

    toast({ title: "ลบที่อยู่สำเร็จ" })
  } catch (err) {
    console.error(err)
    toast({
      title: "ไม่สามารถลบที่อยู่ได้",
      description: "โปรดลองใหม่อีกครั้ง",
      variant: "destructive",
    })
  }
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">ที่อยู่จัดส่ง</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-muted-foreground mt-4">กำลังโหลด...</p>
        ) : (
          <div className="space-y-3 mt-4">
            {/* existing addresses */}
            {addresses.map((address) =>
              editingId === address.id ? (
                <div key={address.id} className="border rounded-lg p-3 md:p-4 space-y-3">
                  <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="ชื่อผู้รับ" />
                  <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="เบอร์โทรศัพท์" />
                  <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="บ้านเลขที่ / อาคาร / ซอย / แขวง" />
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="เขต / อำเภอ" />
                  <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="จังหวัด" />
                  <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="รหัสไปรษณีย์" />
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="ประเทศ" />

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEditSave} className="bg-amber-600 hover:bg-amber-700 flex-1">
                      บันทึก
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="flex-1"
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={address.id} className="border rounded-lg p-3 md:p-4 flex justify-between items-start">
                  <div className="text-sm break-words flex-1">
                    <p className="font-medium">{address.recipient_name}</p>
                    <p>{address.phone_number}</p>
                    <p>{address.street_address}</p>
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(address)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(address.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            )}

            {/* add new address */}
            {isAdding ? (
              <div className="border rounded-lg p-3 md:p-4 space-y-3">
                <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="ชื่อผู้รับ" />
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="เบอร์โทรศัพท์" />
                <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="บ้านเลขที่ / อาคาร / ซอย / แขวง" />
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="เขต / อำเภอ" />
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="จังหวัด" />
                <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="รหัสไปรษณีย์" />
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="ประเทศ" />

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAdd} className="bg-green-600 hover:bg-green-700 flex-1">
                    เพิ่ม
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
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
                เพิ่มที่อยู่ใหม่
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
