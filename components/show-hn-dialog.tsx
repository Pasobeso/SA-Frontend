import React, { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";

interface ShowHnDialogProps {
  hospitalNumber: number;
  open: boolean;
  onClose: () => void;
}

function ShowHnDialog(props: ShowHnDialogProps) {
  const [ack, setAck] = useState(false);

  return (
    <Dialog open={props.open}>
      <DialogTitle></DialogTitle>
      <DialogContent
        // disable the default close "X"
        className="flex flex-col items-center text-center space-y-1"
        showCloseButton={false}
      >
        <p className="text-md font-medium">เลขโรงพยาบาลของคุณคือ</p>
        <div className="text-4xl font-bold">{props.hospitalNumber}</div>
        <p className="text-sm text-red-600 font-medium">
          ⚠️ คุณต้องใช้เลขนี้ในการเข้าสู่ระบบ กรุณาจดจำไว้ให้ดี ⚠️
        </p>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="ack"
            checked={ack}
            onCheckedChange={(val) => setAck(Boolean(val))}
          />
          <Label htmlFor="ack">ฉันได้จดหรือจำเลขนี้ไว้แล้ว</Label>
        </div>

        <Button disabled={!ack} onClick={props.onClose} className="w-full">
          ปิดหน้าต่าง
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default ShowHnDialog;
