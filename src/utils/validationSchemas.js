import * as Yup from "yup";

const getCandidateValidationSchema = (isEditMode = false) =>
  Yup.object({
    // Basic candidate info - ALL REQUIRED
    candidateNumber: Yup.string().required("Candidate number is required"),
    designation: Yup.string().required("Designation is required"),
    department: Yup.string().required("Department is required"),
    vacancy: Yup.string().required("Vacancy is required"),
    filingDate: Yup.string().required("Filing date is required"),
    uploadCV: Yup.mixed().required("CV is required"),

    // English names - REQUIRED
    firstNameEn: Yup.string().required("First name is required"),
    secondNameEn: Yup.string(),
    thirdNameEn: Yup.string(),
    fourthNameEn: Yup.string(),
    familyNameEn: Yup.string().required("Family name is required"),

    // Arabic names - Optional
    firstNameAr: Yup.string(),
    secondNameAr: Yup.string(),
    thirdNameAr: Yup.string(),
    fourthNameAr: Yup.string(),
    familyNameAr: Yup.string(),

    // Personal info - ALL REQUIRED
    nationalId: Yup.string()
      .required("National ID is required")
      .max(10, "National ID must be at most 10 characters"),
    national_id_issue: Yup.string().required(
      "National ID Issue date is required"
    ),
    national_id_expiry: Yup.string().required(
      "National ID expiry date is required"
    ),
    nationality: Yup.string().required("Nationality is required"),
    uploadNationalID: Yup.mixed().required("National ID is required"),
    gender: Yup.string()
      .oneOf(["male", "female"])
      .required("Gender is required"),
    maritalStatus: Yup.string()
      .oneOf(["single", "married"], "Please select a valid marital status")
      .required("Marital status is required"),
    familyMembers: Yup.number().when("maritalStatus", {
      is: (status) => status === "married",
      then: (schema) =>
        schema
          .typeError("Must be a number")
          .required("Number of family members is required when married")
          .min(1, "Must be at least 1")
          .integer("Must be a whole number"),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
    religion: Yup.string().required("Religion is required"),
    country: Yup.string().required("Country is required"),
    bloodType: Yup.string().required("Blood type is required"),

    // ✅ Required health fields
    height: Yup.string().required("Height is required"),
    weight: Yup.string().required("Weight is required"),
    dangerious_disease: Yup.string()
      .oneOf(["yes", "no"], "Select Yes or No")
      .required("Please select Yes or No"),
    disease_details: Yup.string().when("dangerious_disease", {
      is: "yes",
      then: (s) =>
        s.trim().min(3, "Please add details").required("Disease details is required"),
      otherwise: (s) => s.strip().optional(),
    }),
    mental_illness: Yup.string()
      .oneOf(["yes", "no"], "Select Yes or No")
      .required("Please select Yes or No"),
    illness_details: Yup.string().when("mental_illness", {
      is: "yes",
      then: (s) =>
        s.trim().min(3, "Please add details").required("Mental illness details is required"),
      otherwise: (s) => s.strip().optional(),
    }),
    surgery: Yup.string()
      .oneOf(["yes", "no"], "Select Yes or No")
      .required("Please select Yes or No"),
    suregry_details: Yup.string().when("surgery", {
      is: "yes",
      then: (s) =>
        s.trim().min(3, "Please add details").required("Surgery details is required"),
      otherwise: (s) => s.strip().optional(),
    }),
    drugs: Yup.string()
      .oneOf(["yes", "no"], "Select Yes or No")
      .required("Please select Yes or No"),
    drugs_details: Yup.string().when("drugs", {
      is: "yes",
      then: (s) =>
        s.trim().min(3, "Please add details").required("Drugs details is required"),
      otherwise: (s) => s.strip().optional(),
    }),
    defaulted: Yup.string()
      .oneOf(["yes", "no"], "Select Yes or No")
      .required("Please select Yes or No"),
    defaulted_details: Yup.string().when("defaulted", {
      is: "yes",
      then: (s) =>
        s.trim().min(3, "Please add details").required("Defaulter reason is required"),
      otherwise: (s) => s.strip().optional(),
    }),
    dismissed: Yup.string()
      .oneOf(["yes", "no"], "Select Yes or No")
      .required("Please select Yes or No"),
    dismissed_details: Yup.string().when("dismissed", {
      is: "yes",
      then: (s) =>
        s.trim().min(3, "Please add details").required("Reason is required"),
      otherwise: (s) => s.strip().optional(),
    }),

    extra_hours: Yup.string()
      .oneOf(["yes", "no"], "Select Yes or No")
      .required("Please select Yes or No"),
    extra_hours_details: Yup.string().when("extra_hours", {
      is: "no",
      then: (s) =>
        s.trim().min(3, "Please add details").required("Reason is required"),
      otherwise: (s) => s.strip().optional(),
    }),
    relative: Yup.string()
      .oneOf(["yes", "no"], "Select Yes or No")
      .required("Please select Yes or No"),
    relatives_details: Yup.string().when("relative", {
      is: "yes",
      then: (s) =>
        s.trim().min(3, "Please add details").required("Relatives details is required"),
      otherwise: (s) => s.strip().optional(),
    }),
    // dangerious_disease: Yup.string().required(
    //   "Dangerious disease information is required"
    // ),
    // mental_illness: Yup.string().required(
    //   "Mental illness information is required"
    // ),
    // surgery: Yup.string().required("Surgery information is required"),

    // Address info - ALL REQUIRED
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    poBox: Yup.string()
      .required("P.O. Box is required")
      .max(25, "P.O. Box must be at most 25 characters"),
    zipCode: Yup.string()
      .required("Zip code is required")
      .max(25, "Zip code must be at most 25 characters"),
    street_name: Yup.string().required("Street Name is required"),
    neighbour_name: Yup.string().required("Neighbour Name is required"),
    building_number: Yup.string().required("Building Number is required"),
    additional_number: Yup.string().required("Additional Number is required"),
    relative_name: Yup.string().required("Relative Name is required"),
    telephone: Yup.string().max(15, "Telephone must be at most 15 characters"),
    mobile: Yup.string()
      .required("Mobile is required")
      .max(15, "Mobile must be at most 15 characters"),
    otherPhone: Yup.string()
      .required("Other phone is required")
      .max(15, "Other phone must be at most 15 characters"),

    // Contact info - REQUIRED
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    address: Yup.string()
      .test("no-spaces", "Spaces are not allowed", (value) => {
        return !value || value.trim().length > 0;
      })
      .required("Address is required"),
    notes: Yup.string()
      .optional()
      .test("no-spaces", "Spaces are not allowed", (value) => {
        return !value || value.trim().length > 0;
      }),

    // Birth info - REQUIRED
    birthPlace: Yup.string().required("Birth place is required"),
    dateOfBirth: Yup.date()
      .max(
        new Date(new Date().setHours(0, 0, 0, 0) - 1),
        "Date of birth must be before today"
      )
      .required("Date of birth is required"),

    drivingLicense: Yup.boolean(),

    // Passport info - Make all required
    passportType: Yup.string().test(
      "required-for-non-saudi",
      "Passport type is required",
      function (value) {
        const { nationality } = this.parent;
        if (nationality && nationality !== "SA") {
          return !!value;
        }
        return true;
      }
    ),

    passportNumber: Yup.string().test(
      "required-for-non-saudi",
      "Passport number is required",
      function (value) {
        const { nationality } = this.parent;
        if (nationality && nationality !== "SA") {
          return !!value && value.length >= 3 && value.length <= 9;
        }
        return true;
      }
    ),

    issuePlace: Yup.string().test(
      "required-for-non-saudi",
      "Issue place is required",
      function (value) {
        const { nationality } = this.parent;
        if (nationality && nationality !== "SA") {
          return !!value;
        }
        return true;
      }
    ),

    issueDate: Yup.string()
      .nullable()
      .test(
        "required-for-non-saudi",
        "Issue date is required",
        function (value) {
          const { nationality } = this.parent;
          if (nationality && nationality !== "SA") {
            if (!value) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(value) <= today;
          }
          return true;
        }
      ),

    uploadPassport: Yup.mixed().required("Passport is required"),

    expiryDate: Yup.string()
      .nullable()
      .test(
        "required-for-non-saudi",
        "Expiry date is required",
        function (value) {
          const { nationality, issueDate } = this.parent;
          if (nationality && nationality !== "SA") {
            if (!value || !issueDate) return false;
            return new Date(value) > new Date(issueDate);
          }
          return true;
        }
      ),

    // Education summary
    // highSchoolAverage: Yup.string().typeError("Must be a number") ,
    // highSchoolStream: Yup.string(),

    // Experience summary - REQUIRED
    experienceYears: Yup.number()
      .nullable()
      .typeError("Must be a number")
      .required("Experience Years is required"),
    numberOfSubordinates: Yup.number()
      .nullable()
      .typeError("Must be a number")
      .required("Number of Subordinates is required"),
    expectedSalary: Yup.number()
      .required("Expected Salary is Required")
      .typeError("Must be a number"),
    computerSkills: Yup.string()
      .test("no-spaces", "Spaces are not allowed", (value) => {
        return !value || value.trim().length > 0;
      })
      .required("Computer Skills is required"),
    availablePosition: Yup.string().required("Available Position is required"),
    currentBenefits: Yup.string()
      .test("no-spaces", "Spaces are not allowed", (value) => {
        return !value || value.trim().length > 0;
      })
      .required("Current Benefits is required"),

    education: Yup.array().of(
      Yup.object().shape({
        education: Yup.string().required("Education is required"),
        major: Yup.string().required("Major is required"),
        otherMajor: Yup.string().required("Other major is required"),
        instituteName: Yup.string().required("Institute Name is required"),
        grade: Yup.string().required("Grade is required"),
        passingYear: Yup.string().required("Passing Year is required"),
        attachment: Yup.string().required("Attachment is required"),
      })
    ),

    // experience: Yup.array().of(Yup.object({
    //   company_name: Yup.string().required('Required'),
    //   jobTitle: Yup.string().required('Required'),
    //   industry: Yup.string().required('Required'),
    //   country: Yup.string().required('Required'),
    //   city: Yup.string().required('Required'),
    //   salary: Yup.number().nullable().typeError('Required').required("Salary is required"),
    //   currency: Yup.string().required('Required'),
    //   fromDate: Yup.string().required('Required'),
    //   toDate: Yup.string().required('Required').test('toDate-after-fromDate', 'To date must be after From date', function (toDate) {
    //     const { fromDate } = this.parent;
    //     if (fromDate && toDate) {
    //       return new Date(toDate) > new Date(fromDate);
    //     }
    //     return true;
    //   }),
    //   reason: Yup.string().required('Required'),
    //   source: Yup.string().required('Required'),
    // })).min(1, 'At least one experience record is required'),

    languages: Yup.array().of(
      Yup.object({
        language: Yup.string().required("Language is required"),
        read: Yup.string().required("Read is required"),
        write: Yup.string().required("Write is required"),
        speak: Yup.string().required("Speak is required"),
      })
    ),

    // .min(1, 'At least one language record is required'),

    // competencies: Yup.array().of(Yup.object({
    //   type: Yup.string().required('Required'),
    //   competency: Yup.string().required('Required'),
    //   level: Yup.string().required('Required'),
    // })).min(1, 'At least one competency record is required'),

    // relatives: Yup.array().of(Yup.object({
    //   relative: Yup.string().required('Required'),
    //   branch: Yup.string().required('Required'),
    //   unit: Yup.string().required('Required'),
    //   department: Yup.string().required('Required'),
    //   division: Yup.string().required('Required'),
    //   section: Yup.string().required('Required'),
    //   jobTitle: Yup.string().required('Required'),
    // })).min(1, 'At least one relative record is required'),

    // certifications: Yup.array().of(Yup.object({
    //   certificate: Yup.string(),
    //   institute: Yup.string(),
    //   certificationDate: Yup.date().nullable(),
    //   country: Yup.string(),
    //   expiryDate: Yup.date().nullable().test('expiryDate-after-certificationDate', 'Expiry date must be after Certification date', function (expiryDate) {
    //     const { certificationDate } = this.parent;
    //     if (certificationDate && expiryDate) {
    //       return new Date(expiryDate) > new Date(certificationDate);
    //     }
    //     return true;
    //   }),
    // })),

    certifications: Yup.array().of(
      Yup.object().shape({
        certificate: Yup.string().required("Certificate is required"),
        institute: Yup.string().required("Institute is required"),
        certificationDate: Yup.string().required(
          "Certification date is required"
        ),
        country: Yup.string().required("Country is required"),
        expiryDate: Yup.string().required("Expiry date is required"),
        attachment: Yup.string().required("Attachment is required"),
      })
    ),

    disclaimer: Yup.boolean()
      .oneOf([true], "You must accept the disclaimer before submitting")
      .required("You must accept the disclaimer before submitting"),

    password: isEditMode
      ? Yup.string().notRequired()
      : Yup.string()
          .required("Password is required")
          .min(8, "Password must be at least 8 characters")
          .matches(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
          )
          .matches(
            /[a-z]/,
            "Password must contain at least one lowercase letter"
          )
          .matches(/[0-9]/, "Password must contain at least one number")
          .matches(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
          ),

    confirm_password: isEditMode
      ? Yup.string().notRequired()
      : Yup.string()
          .oneOf([Yup.ref("password"), null], "Passwords must match")
          .required("Confirm password is required"),
  }).test(
    "passport-issue-before-expiry",
    "Passport expiry date must be after issue date",
    function (values) {
      if (values.issueDate && values.expiryDate) {
        return new Date(values.expiryDate) > new Date(values.issueDate);
      }
      return true;
    }
  );

const getInterviewValidationSchema = (reportType) => {
  const schemaFields = {
    first_interview_date: Yup.date().nullable(),
    first_interview_time: Yup.string().nullable(),
    interviewer_id: Yup.number().nullable(),

    second_interview_date: Yup.date().nullable(),
    second_interview_time: Yup.string().nullable(),
    second_interviewer_id: Yup.number().nullable(),

    third_interview_date: Yup.date().nullable(),
    third_interview_time: Yup.string().nullable(),
    third_interviewer_id: Yup.number().nullable(),
  };

  if (reportType === "first_interview") {
    schemaFields.first_interview_date =
      schemaFields.first_interview_date.required(
        "Date is required for the first interview"
      );
    schemaFields.first_interview_time =
      schemaFields.first_interview_time.required(
        "Time is required for the first interview"
      );
    schemaFields.interviewer_id = schemaFields.interviewer_id.required(
      "Interviewer is required for the first interview"
    );
  } else if (reportType === "second_interview") {
    schemaFields.second_interview_date =
      schemaFields.second_interview_date.required(
        "Date is required for the second interview"
      );
    schemaFields.second_interview_time =
      schemaFields.second_interview_time.required(
        "Time is required for the second interview"
      );
    schemaFields.second_interviewer_id =
      schemaFields.second_interviewer_id.required(
        "Second interviewer is required"
      );
  } else if (reportType === "third_interview") {
    schemaFields.third_interview_date =
      schemaFields.third_interview_date.required(
        "Date is required for the third interview"
      );
    schemaFields.third_interview_time =
      schemaFields.third_interview_time.required(
        "Time is required for the third interview"
      );
    schemaFields.third_interviewer_id =
      schemaFields.third_interviewer_id.required(
        "Third interviewer is required"
      );
  }
  const interviewTypeField = `${reportType}_type`;
  const interviewUrlField = `${reportType}_url`;
  const interviewLocationField = `${reportType}_location`;
  const panelMembersField = `${reportType}_panel_members`;

  schemaFields[interviewTypeField] = Yup.string().required(
    "Interview type is required"
  );

  schemaFields[interviewUrlField] = Yup.string().when(interviewTypeField, {
    is: "online",
    then: (schema) => schema.required("Interview URL is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  });

  schemaFields[interviewLocationField] = Yup.string().when(interviewTypeField, {
    is: "physical",
    then: (schema) => schema.required("Interview location is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  });
  schemaFields[panelMembersField] = Yup.array()
    .of(Yup.number().required())
    .max(2, "You can select at most 2 panel members")
    .notRequired()
    .nullable();

  return Yup.object().shape(schemaFields);
};

export { getCandidateValidationSchema, getInterviewValidationSchema };
