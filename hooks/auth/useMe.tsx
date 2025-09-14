"use client";

import { Auth } from "@/lib/api/auth";
import { Users } from "@/lib/api/users";
import { useEffect, useState } from "react";

function useMe() {
  const [me, setMe] = useState<Auth.GetMeResponseModel | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

  async function refetch() {
    try {
      const res = await Auth.getMe();
      setMe(res.data);
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  return {
    me,
    isLoggedIn,
    refetch,
  };
}

export default useMe;
