interface Props {
  params: Promise<{
    page:
      | "grievance"
      | "faculty"
      | "hostel";
  }>;
}

const page = async ({ params }: Props) => {
  const page = (await params).page;
  

  return (
    <>
      <h1 className="capitalize">{page}</h1>
      <br />
          
    </>
  )
}

export default page