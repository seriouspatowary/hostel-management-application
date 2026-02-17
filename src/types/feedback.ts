export type FeedbackRow = {
    _id: string,
    school: string
    department: string
    programme: string
    academicYear: string
    name: string
    rollNumber: string
    email: string
    contactNumber: string
    grievanceTypes: string[]
    otherGrievance?: string
    grievanceDetails: string
    previouslyReported?: string
    followUpDetails?: string
    resolution?: string
    submittedAt: string
    status: string
  }
  