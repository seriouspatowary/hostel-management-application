export type FacultyRow = {
    name: string
    photo: string // base64 image URI
    currentDesignation: string
    googleScholarID: string
    scopusID: string
  
    educationalQualifications: {
        degreeName: string;
        schoolCollege: string;
        boardUniversity: string;
        divisionGrade: string;
        passingYear: string;
        marksPercentage: string;
        _id?: string;
      }[];
      
    coreSubjectExpertise: string[]
    interdisciplinaryExpertise: string[]
    researchFocus: string[]
    industryApplications: string[]

    workExperience: {
        company: string;     
        designation: string;
        startDate: string;
        endDate: string;
        _id?: string;
      }[];
  
    publications: {
        bookChapters: { id: string; value: string; _id?: string }[];
        bookPublished: { id: string; value: string; _id?: string }[];
        conferencePapers: { id: string; value: string; _id?: string }[];
        journalArticles: { id: string; value: string; _id?: string }[];
      };
      
    honoursAndAwards: {

        academicDistinctions: { id: string; value: string; _id?: string }[];
        professionalRecognitions: { id: string; value: string; _id?: string }[];
        teachingExcellenceAwards: { id: string; value: string; _id?: string }[];
        scholarshipsVisitingPositions: { id: string; value: string; _id?: string }[];
        fellowship: { id: string; value: string; _id?: string }[];
        honoursFromProfessionalBodies: { id: string; value: string; _id?: string }[];
    }

    patents: {
        title: string;
        typeOfPatent: string;
        patentsPublished: string;
        awardedGranted: string;
        commercialized: string;
        _id?: string;
      }[];
      
    researchGrants:{
        organization: string;
        status: string;
        role: string;
        _id?: string;
      }[];

    phdGuidance: {
        guiding: string,
        awarded: string,

    }

   
  }
  