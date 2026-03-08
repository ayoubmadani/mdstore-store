"use client"

import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function SetCustomerId() {
  useEffect(() => {
    const existingId = localStorage.getItem("customerId");
    if (!existingId) {
      localStorage.setItem("customerId", uuidv4());
    }
  }, []);

  return null; // هذا المكون لا يرندر شيئاً، فقط ينفذ الوظيفة
}