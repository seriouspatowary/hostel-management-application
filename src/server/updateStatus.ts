

export default async function updateStatus(id: string, newStatus: "pending" | "resolved") {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
  
      if (!res.ok) {
        throw new Error(`Failed to update status. Server returned ${res.status}`)
      }
  
      return await res.json()
    } catch (error) {
      console.error("Status update failed:", error)
      throw error
    }
  }
  