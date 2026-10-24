"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {getDemoSession,type DemoSession} from "@/modules/assessments/auth/demo-auth";
import "./header.css";

const SUPER_ADMIN_ROUTES: Record<string, string> = {
  "/super_admin": "Profile and Identity",
  "/superadmin_security": "Security and Access",
  "/superadmin_preferences": "Preferences",
  "/superadmin_audit": "Audit and system",
};

const PLATFORM_ADMIN_ROUTES: Record<string, string> = {
  "/platform_admin": "Profile and Identity",
  "/platformadmin": "Profile and Identity",
  "/platformadmin_profile": "Profile and Identity",
  "/platformadmin_security": "Security and Access",
  "/platformadmin_preferences": "Preferences",
  "/platformadmin_audit": "Audit and system",
};

const INSTITUTION_ADMIN_ROUTES: Record<string, string> = {
  "/institution_admin": "Profile and Identity",
  "/institutionadmin": "Profile and Identity",
  "/institutionadmin_profile": "Profile and Identity",
  "/institutionadmin_security": "Security and Access",
  "/institutionadmin_preferences": "Preferences",
  "/institutionadmin_audit": "Audit and system",
};

const BOOTCAMP_ROUTES: Record<string, string> = {
  "/bootcamp": "Profile and Identity",
  "/bootcamp_profile": "Profile and Identity",
  "/bootcamp/profile": "Profile and Identity",
  "/bootcamp_security": "Security and Access",
  "/bootcamp/security": "Security and Access",
  "/bootcamp_preferences": "Preferences",
  "/bootcamp/preferences": "Preferences",
  "/bootcamp_audit": "Audit and system",
  "/bootcamp/audit": "Audit and system",
};

const GOVERNMENT_ROUTES: Record<string, string> = {
  "/government": "Profile and Identity",
  "/government_profile": "Profile and Identity",
  "/government/profile": "Profile and Identity",
  "/government_coordinator": "Profile and Identity",
  "/government_coordinator/profile": "Profile and Identity",
  "/government_security": "Security and Access",
  "/government/security": "Security and Access",
  "/government_preferences": "Preferences",
  "/government/preferences": "Preferences",
  "/government_audit": "Audit and system",
  "/government/audit": "Audit and system",
};

const UNIVERSITY_ROUTES: Record<string, string> = {
  "/coordinator_university": "Profile and Identity",
  "/university": "Profile and Identity",
  "/university_profile": "Profile and Identity",
  "/university/profile": "Profile and Identity",
  "/university_security": "Security and Access",
  "/university/security": "Security and Access",
  "/university_preferences": "Preferences",
  "/university/preferences": "Preferences",
  "/university_audit": "Audit and system",
  "/university/audit": "Audit and system",
};

const COORDINATOR_BOOTCAMP_ROUTES: Record<string, string> = {
  "/coordinator_bootcamp": "Profile and Identity",
};

const COORDINATOR_CORPORATE_ROUTES: Record<string, string> = {
  "/coordinator_corporate": "Profile and Identity",
};

const COORDINATOR_GOVERNMENT_ROUTES: Record<string, string> = {
  "/coordinator_government": "Profile and Identity",
};

const COORDINATOR_NGO_ROUTES: Record<string, string> = {
  "/coordinator_ngo": "Profile and Identity",
};

const STUDENT_UNIVERSITY_ROUTES: Record<string, string> = {
  "/student_university": "Profile and Identity",
  "/student_university_profile": "Profile and Identity",
  "/student_university/profile": "Profile and Identity",
};

const STUDENT_BOOTCAMP_ROUTES: Record<string, string> = {
  "/student_bootcamp": "Profile and Identity",
  "/student_bootcamp_profile": "Profile and Identity",
  "/student_bootcamp/profile": "Profile and Identity",
};

const STUDENT_SKILLACADEMY_ROUTES: Record<string, string> = {
  "/student_skillacademy": "Profile and Identity",
  "/student_skillacademy_profile": "Profile and Identity",
  "/student_skillacademy/profile": "Profile and Identity",
};

const STUDENT_CORPORATE_ROUTES: Record<string, string> = {
  "/student_corporate": "Profile and Identity",
  "/student_corporate_profile": "Profile and Identity",
  "/student_corporate/profile": "Profile and Identity",
};

const STUDENT_GOVERNMENT_ROUTES: Record<string, string> = {
  "/student_government": "Profile and Identity",
  "/student_government_profile": "Profile and Identity",
  "/student_government/profile": "Profile and Identity",
};

const STUDENT_NGO_ROUTES: Record<string, string> = {
  "/student_ngo": "Profile and Identity",
  "/student_ngo_profile": "Profile and Identity",
  "/student_ngo/profile": "Profile and Identity",
};

const FACULTY_UNIVERSITY_ROUTES: Record<string, string> = {
  "/faculty_university": "Profile and Identity",
  "/faculty_university_profile": "Profile and Identity",
  "/faculty_university/profile": "Profile and Identity",
};

const FACULTY_SKILLACADEMY_ROUTES: Record<string, string> = {
  "/faculty_skillacademy": "Profile and Identity",
  "/faculty_skillacademy_profile": "Profile and Identity",
  "/faculty_skillacademy/profile": "Profile and Identity",
};

const FACULTY_BOOTCAMP_ROUTES: Record<string, string> = {
  "/faculty_bootcamp": "Profile and Identity",
  "/faculty_bootcamp_profile": "Profile and Identity",
  "/faculty_bootcamp/profile": "Profile and Identity",
};

const FACULTY_CORPORATE_ROUTES: Record<string, string> = {
  "/faculty_corporate": "Profile and Identity",
  "/faculty_corporate_profile": "Profile and Identity",
  "/faculty_corporate/profile": "Profile and Identity",
};

const FACULTY_GOVERNMENT_ROUTES: Record<string, string> = {
  "/faculty_government": "Profile and Identity",
  "/faculty_government_profile": "Profile and Identity",
  "/faculty_government/profile": "Profile and Identity",
};

const FACULTY_NGO_ROUTES: Record<string, string> = {
  "/faculty_ngo": "Profile and Identity",
  "/faculty_ngo_profile": "Profile and Identity",
  "/faculty_ngo/profile": "Profile and Identity",
};

const STUDENT_ROUTES: Record<string, string[]> = {
  "/student_profile": ["Student Profile", "Student Profile"],
  "/studentprofile": ["Student Profile", "Student Profile"],
  "/student_profile/profile": ["Student Profile", "Student Profile"],
  "/studentprofile/profile": ["Student Profile", "Student Profile"],
  "/student_profile/student-profile": [
    "Student Profile",
    "Student Profile",
  ],
  "/studentprofile/student-profile": [
    "Student Profile",
    "Student Profile",
  ],

  "/student_profile/registration": [
    "Student Profile",
    "Registration",
  ],
  "/studentprofile/registration": [
    "Student Profile",
    "Registration",
  ],
  "/student_registration": [
    "Student Profile",
    "Registration",
  ],

  "/student_profile/consent": [
    "Student Profile",
    "Consent",
  ],
  "/studentprofile/consent": [
    "Student Profile",
    "Consent",
  ],
  "/student_consent": [
    "Student Profile",
    "Consent",
  ],
};

export default function Header() {
  const pathname = usePathname();
  const [demoUser,setDemoUser]=useState<DemoSession|null>(null);
  useEffect(()=>{setDemoUser(getDemoSession());},[pathname]);

  const [headerProfileImage, setHeaderProfileImage] =
    useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const normalizedPath =
    pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  // Assessment pages use their own breadcrumb in the page content.
  const assessmentPath = normalizedPath.toLowerCase();
  const isViewerPage = /\/assessments\/[^/]+\/(viewer|results)(?:\/|$)/.test(assessmentPath) || assessmentPath === "/viewer" || assessmentPath.startsWith("/viewer/") || assessmentPath === "/viewresult" || assessmentPath.startsWith("/viewresult/");
  const isAssessmentPage =
    isViewerPage ||
    assessmentPath === "/assessments" ||
    assessmentPath.startsWith("/assessments/") ||
    assessmentPath === "/assessment" ||
    assessmentPath.startsWith("/assessment/") ||
    // Review routes also own their breadcrumb, so the shared Header must not show a profile breadcrumb.
    assessmentPath === "/review" ||
    assessmentPath.startsWith("/review/") ||
    assessmentPath === "/mcq_review" ||
    assessmentPath.startsWith("/mcq_review/") ||
    assessmentPath === "/assessment_review" ||
    assessmentPath.startsWith("/assessment_review/") ||
    assessmentPath === "/mcq" ||
    assessmentPath.startsWith("/mcq/") ||
    assessmentPath.endsWith("/mcq") ||
    assessmentPath === "/content" ||
    assessmentPath.startsWith("/content/") ||
    assessmentPath === "/mcq_content" ||
    assessmentPath.startsWith("/mcq_content/") ||
    // Evaluation uses the same shared Header layout as Assessment/MCQ.
    // Its own breadcrumb is rendered by the Evaluation page.
    assessmentPath === "/evaluation" ||
    assessmentPath.startsWith("/evaluation/") ||
    assessmentPath === "/mcq_evaluation" ||
    assessmentPath.startsWith("/mcq_evaluation/") ||
    assessmentPath === "/assessment_evaluation" ||
    assessmentPath.startsWith("/assessment_evaluation/") ||
    assessmentPath.includes("/assessment-management/");

  const isPlatformAdmin =
    normalizedPath.startsWith("/platform_admin") ||
    normalizedPath.startsWith("/platformadmin");

  const isInstitutionAdmin =
    normalizedPath.startsWith("/institution_admin") ||
    normalizedPath.startsWith("/institutionadmin");

  const isBootcamp =
    normalizedPath === "/coordinator_bootcamp" ||
    normalizedPath.startsWith("/coordinator_bootcamp/") ||
    normalizedPath === "/bootcamp" ||
    normalizedPath.startsWith("/bootcamp_") ||
    normalizedPath.startsWith("/bootcamp/");

  const isUniversity =
    normalizedPath === "/coordinator_university" ||
    normalizedPath.startsWith("/coordinator_university/") ||
    normalizedPath === "/university" ||
    normalizedPath.startsWith("/university_") ||
    normalizedPath.startsWith("/university/");

  const isCorporate =
    normalizedPath === "/coordinator_corporate" ||
    normalizedPath.startsWith("/coordinator_corporate/");

  const isCoordinatorGovernment =
    normalizedPath === "/coordinator_government" ||
    normalizedPath.startsWith("/coordinator_government/");

  const isNgo =
    normalizedPath === "/coordinator_ngo" ||
    normalizedPath.startsWith("/coordinator_ngo/");

  const isGovernment =
    isCoordinatorGovernment ||
    normalizedPath === "/government" ||
    normalizedPath.startsWith("/government_") ||
    normalizedPath.startsWith("/government/") ||
    normalizedPath.startsWith("/government_coordinator");

  const isStudentUniversity =
    normalizedPath === "/student_university" ||
    normalizedPath.startsWith("/student_university/") ||
    normalizedPath.startsWith("/student_university_");

  const isStudentBootcamp =
    normalizedPath === "/student_bootcamp" ||
    normalizedPath.startsWith("/student_bootcamp/") ||
    normalizedPath.startsWith("/student_bootcamp_");

  const isStudentSkillAcademy =
    normalizedPath === "/student_skillacademy" ||
    normalizedPath.startsWith("/student_skillacademy/") ||
    normalizedPath.startsWith("/student_skillacademy_");

  const isStudentCorporate =
    normalizedPath === "/student_corporate" ||
    normalizedPath.startsWith("/student_corporate/") ||
    normalizedPath.startsWith("/student_corporate_");

  const isStudentGovernment =
    normalizedPath === "/student_government" ||
    normalizedPath.startsWith("/student_government/") ||
    normalizedPath.startsWith("/student_government_");

  const isStudentNgo =
    normalizedPath === "/student_ngo" ||
    normalizedPath.startsWith("/student_ngo/") ||
    normalizedPath.startsWith("/student_ngo_");

  const isFacultyUniversity =
    normalizedPath === "/faculty_university" ||
    normalizedPath.startsWith("/faculty_university/") ||
    normalizedPath.startsWith("/faculty_university_");

  const isFacultySkillAcademy =
    normalizedPath === "/faculty_skillacademy" ||
    normalizedPath.startsWith("/faculty_skillacademy/") ||
    normalizedPath.startsWith("/faculty_skillacademy_");

  const isFacultyBootcamp =
    normalizedPath === "/faculty_bootcamp" ||
    normalizedPath.startsWith("/faculty_bootcamp/") ||
    normalizedPath.startsWith("/faculty_bootcamp_");

  const isFacultyCorporate =
    normalizedPath === "/faculty_corporate" ||
    normalizedPath.startsWith("/faculty_corporate/") ||
    normalizedPath.startsWith("/faculty_corporate_");

  const isFacultyGovernment =
    normalizedPath === "/faculty_government" ||
    normalizedPath.startsWith("/faculty_government/") ||
    normalizedPath.startsWith("/faculty_government_");

  const isFacultyNgo =
    normalizedPath === "/faculty_ngo" ||
    normalizedPath.startsWith("/faculty_ngo/") ||
    normalizedPath.startsWith("/faculty_ngo_");

  const isStudent =
    !isStudentUniversity &&
    !isStudentBootcamp &&
    !isStudentSkillAcademy &&
    !isStudentCorporate &&
    !isStudentGovernment &&
    !isStudentNgo &&
    (normalizedPath.startsWith("/student_profile") ||
      normalizedPath.startsWith("/studentprofile") ||
      normalizedPath.startsWith("/student_"));

  const isSuperAdmin =
    normalizedPath.startsWith("/super_admin") ||
    normalizedPath.startsWith("/superadmin");

  const profileStorageKey = isViewerPage
    ? "studentProfileImage"
    : isAssessmentPage
    ? "institutionAdminProfileImage"
    : isPlatformAdmin
    ? "platformAdminProfileImage"
    : isInstitutionAdmin
      ? "institutionAdminProfileImage"
      : isSuperAdmin
        ? "superAdminProfileImage"
        : isStudentUniversity
          ? "studentUniversityProfileImage"
          : isStudentBootcamp
            ? "studentBootcampProfileImage"
            : isStudentSkillAcademy
              ? "studentSkillAcademyProfileImage"
              : isStudentCorporate
              ? "studentCorporateProfileImage"
              : isStudentGovernment
                ? "studentGovernmentProfileImage"
                : isStudentNgo
                  ? "studentNgoProfileImage"
                  : isFacultyUniversity
                    ? "facultyUniversityProfileImage"
                    : isFacultySkillAcademy
                      ? "facultySkillAcademyProfileImage"
                      : isFacultyBootcamp
                        ? "facultyBootcampProfileImage"
                        : isFacultyCorporate
                          ? "facultyCorporateProfileImage"
                          : isFacultyGovernment
                            ? "facultyGovernmentProfileImage"
                            : isFacultyNgo
                              ? "facultyNgoProfileImage"
                              : isUniversity
              ? "universityCoordinatorProfileImage"
              : isBootcamp
                ? "bootcampCoordinatorProfileImage"
                : isCorporate
                  ? "corporateCoordinatorProfileImage"
                  : isGovernment
                    ? "governmentCoordinatorProfileImage"
                    : isNgo
                      ? "ngoCoordinatorProfileImage"
                      : isStudent
                        ? "studentProfileImage"
                        : null;

  const currentPage = isStudentUniversity
    ? STUDENT_UNIVERSITY_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isStudentBootcamp
    ? STUDENT_BOOTCAMP_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isStudentSkillAcademy
    ? STUDENT_SKILLACADEMY_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isStudentCorporate
    ? STUDENT_CORPORATE_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isStudentGovernment
    ? STUDENT_GOVERNMENT_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isStudentNgo
    ? STUDENT_NGO_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isFacultyUniversity
    ? FACULTY_UNIVERSITY_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isFacultySkillAcademy
    ? FACULTY_SKILLACADEMY_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isFacultyBootcamp
    ? FACULTY_BOOTCAMP_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isFacultyCorporate
    ? FACULTY_CORPORATE_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isFacultyGovernment
    ? FACULTY_GOVERNMENT_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isFacultyNgo
    ? FACULTY_NGO_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isCorporate
    ? COORDINATOR_CORPORATE_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isNgo
    ? COORDINATOR_NGO_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isCoordinatorGovernment
    ? COORDINATOR_GOVERNMENT_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isGovernment
    ? GOVERNMENT_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isUniversity
    ? UNIVERSITY_ROUTES[normalizedPath] ??
      "Profile and Identity"
    : isBootcamp
      ? COORDINATOR_BOOTCAMP_ROUTES[normalizedPath] ??
        BOOTCAMP_ROUTES[normalizedPath] ??
        "Profile and Identity"
      : isInstitutionAdmin
        ? INSTITUTION_ADMIN_ROUTES[normalizedPath] ??
          "Profile and Identity"
        : isPlatformAdmin
          ? PLATFORM_ADMIN_ROUTES[normalizedPath] ??
            "Profile and Identity"
          : SUPER_ADMIN_ROUTES[normalizedPath] ??
            "Profile and Identity";

  const profileTitle = isStudentUniversity
    ? "University/ College Student Profile"
    : isStudentBootcamp
    ? "Bootcamp Learner Profile"
    : isStudentSkillAcademy
    ? "Skill academy Learner Profile"
    : isStudentCorporate
    ? "Corporate Trainee Profile"
    : isStudentGovernment
    ? "Government Trainee Profile"
    : isStudentNgo
    ? "NGO Trainee Profile"
    : isFacultyUniversity
    ? "University/ College Faculty Profile"
    : isFacultySkillAcademy
    ? "Skill Academy Faculty Profile"
    : isFacultyBootcamp
    ? "Bootcamp Faculty Profile"
    : isFacultyCorporate
    ? "Corporate Faculty Profile"
    : isFacultyGovernment
    ? "Government Faculty Profile"
    : isFacultyNgo
    ? "NGO Faculty Profile"
    : isCorporate
    ? "Corporate Coordinator Profile"
    : isNgo
    ? "NGO Coordinator Profile"
    : isGovernment
    ? "Government Coordinator Profile"
    : isUniversity
    ? "University/ College Coordinator Profile"
    : isBootcamp
      ? "Bootcamp Coordinator Profile"
      : isInstitutionAdmin
        ? "Institution admin Profile"
        : isPlatformAdmin
          ? "Platform admin Profile"
          : "Super admin Profile";

  const userName = isStudentUniversity
    ? "Antony Thomas"
    : isStudentBootcamp
    ? "Antony Thomas"
    : isStudentSkillAcademy
    ? "Antony Thomas"
    : isStudentCorporate
    ? "Antony Thomas"
    : isStudentGovernment
    ? "Antony Thomas"
    : isStudentNgo
    ? "Antony Thomas"
    : isFacultyUniversity
    ? "Antony Thomas"
    : isFacultySkillAcademy
    ? "Antony Thomas"
    : isFacultyBootcamp
    ? "Antony Thomas"
    : isFacultyCorporate
    ? "Antony Thomas"
    : isFacultyGovernment
    ? "Antony Thomas"
    : isFacultyNgo
    ? "Antony Thomas"
    : isCorporate
    ? "Antony Thomas"
    : isNgo
    ? "Antony Thomas"
    : isGovernment
    ? "Antony Thomas"
    : isUniversity
    ? "Antony Thomas"
    : isBootcamp
      ? "Antony Thomas"
      : isInstitutionAdmin
        ? "Antony Thomas"
        : isPlatformAdmin
          ? "Suresh Kumar"
          : isStudent
            ? "Student"
            : "Rajesh Mehta";

  const userRole = isStudentUniversity
    ? "University Student"
    : isStudentBootcamp
    ? "Bootcamp Learner"
    : isStudentSkillAcademy
    ? "Skill academy Student"
    : isStudentCorporate
    ? "Corporate Trainee"
    : isStudentGovernment
    ? "Government Trainee"
    : isStudentNgo
    ? "NGO Trainee"
    : isFacultyUniversity
    ? "University/ College Faculty"
    : isFacultySkillAcademy
    ? "Skill Academy Faculty"
    : isFacultyBootcamp
    ? "Bootcamp Faculty"
    : isFacultyCorporate
    ? "Corporate Faculty"
    : isFacultyGovernment
    ? "Government Faculty"
    : isFacultyNgo
    ? "NGO Faculty"
    : isCorporate
    ? "Corporate Coordinator"
    : isNgo
    ? "NGO Coordinator"
    : isGovernment
    ? "Government Coordinator"
    : isUniversity
    ? "University Coordinator"
    : isBootcamp
      ? "Bootcamp Coordinator"
      : isInstitutionAdmin
        ? "Institution admin"
        : isPlatformAdmin
          ? "Platform admin"
          : isStudent
            ? "Student"
            : "Super admin";

  const arrowRightIcon = isCorporate
    ? "/assets/superadminicons/arrowright.svg"
    : isNgo
    ? "/assets/superadminicons/arrowright.svg"
    : isGovernment
    ? "/assets/superadminicons/arrowright.svg"
    : isBootcamp
    ? "/assets/superadminicons/arrowright.svg"
    : isUniversity
      ? "/assets/superadminicons/arrowright.svg"
      : isPlatformAdmin
        ? "/assets/platformadmin.imagesandicons/arrowright.svg"
        : "/assets/superadminicons/arrowright.svg";

  const notificationIcon = isCorporate
    ? "/assets/assessmenticons/bell.svg"
    : isNgo
    ? "/assets/superadminicons/notification.svg"
    : isGovernment
    ? "/assets/superadminicons/notification.svg"
    : isBootcamp
    ? "/assets/superadminicons/notification.svg"
    : isUniversity
      ? "/assets/superadminicons/notification.svg"
      : isPlatformAdmin
        ? "/assets/platformadmin.imagesandicons/notification.svg"
        : "/assets/superadminicons/notification.svg";

  const profileImage = isStudentUniversity
    ? headerProfileImage || "/assets/studenticons/profile.png"
    : isStudentBootcamp
    ? headerProfileImage || "/assets/studenticons/profile.png"
    : isStudentSkillAcademy
    ? headerProfileImage || "/assets/studenticons/profile.png"
    : isStudentCorporate
    ? headerProfileImage || "/assets/studenticons/profile.png"
    : isStudentGovernment
    ? headerProfileImage || "/assets/studenticons/profile.png"
    : isStudentNgo
    ? headerProfileImage || "/assets/studenticons/profile.png"
    : isFacultyUniversity
    ? headerProfileImage || "/assets/funiversityimages/profile.png"
    : isFacultySkillAcademy
    ? headerProfileImage || "/assets/funiversityimages/profile.png"
    : isFacultyBootcamp
    ? headerProfileImage || "/assets/funiversityimages/profile.png"
    : isFacultyCorporate
    ? headerProfileImage || "/assets/funiversityimages/profile.png"
    : isFacultyGovernment
    ? headerProfileImage || "/assets/funiversityimages/profile.png"
    : isFacultyNgo
    ? headerProfileImage || "/assets/funiversityimages/profile.png"
    : isCorporate
    ? headerProfileImage || "/assets/institutionimages/profile.png"
    : isNgo
    ? headerProfileImage || "/assets/institutionimages/profile.png"
    : isGovernment
    ? headerProfileImage || "/assets/institutionimages/profile.png"
    : isUniversity
    ? headerProfileImage || "/assets/institutionimages/profile.png"
    : isBootcamp
      ? headerProfileImage || "/assets/institutionimages/profile.png"
      : isInstitutionAdmin
        ? headerProfileImage || "/assets/institutionimages/profile.png"
        : isPlatformAdmin
          ? headerProfileImage || "/assets/platformadmin.imagesandicons/profile.png"
          : isSuperAdmin
            ? headerProfileImage || "/assets/superadminimages/profile.png"
            : isStudent
              ? headerProfileImage || "/assets/studenticons/profile.png"
              : "/assets/superadminimages/profile.png";

  useEffect(() => {
    if (!profileStorageKey) {
      setHeaderProfileImage(null);
      return;
    }

    const readSavedHeaderProfileImage = () => {
      try {
        return (
          localStorage.getItem(profileStorageKey) ||
          sessionStorage.getItem(profileStorageKey)
        );
      } catch {
        return null;
      }
    };

    /* Initial page load:
       use the image previously saved for this exact profile route. */
    setHeaderProfileImage(readSavedHeaderProfileImage());

    /* profileImageUpdated supports both:
       1) the new direct-image event used below, and
       2) older pages that only dispatch a normal event after saving. */
    const handleProfileImageUpdated = (event: Event) => {
      if (event instanceof CustomEvent) {
        const detail = event.detail as
          | {
              storageKey?: string;
              image?: string;
            }
          | undefined;

        if (
          detail?.storageKey === profileStorageKey &&
          typeof detail.image === "string" &&
          detail.image
        ) {
          setHeaderProfileImage(detail.image);
          return;
        }
      }

      const savedImage = readSavedHeaderProfileImage();

      /* Do not erase a freshly uploaded in-memory image when browser
         storage could not save it. Only replace when a saved image exists. */
      if (savedImage) {
        setHeaderProfileImage(savedImage);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== profileStorageKey) {
        return;
      }

      setHeaderProfileImage(event.newValue);
    };

    window.addEventListener(
      "profileImageUpdated",
      handleProfileImageUpdated
    );
    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "profileImageUpdated",
        handleProfileImageUpdated
      );
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [profileStorageKey]);

  useEffect(() => {
    const isCoordinatorPage =
      isSuperAdmin ||
      isPlatformAdmin ||
      isInstitutionAdmin ||
      isStudent ||
      isStudentUniversity ||
      isStudentBootcamp ||
      isStudentSkillAcademy ||
      isStudentCorporate ||
      isStudentGovernment ||
      isStudentNgo ||
      isFacultyUniversity ||
      isFacultySkillAcademy ||
      isFacultyBootcamp ||
      isFacultyCorporate ||
      isFacultyGovernment ||
      isFacultyNgo ||
      isUniversity ||
      isBootcamp ||
      isCorporate ||
      isGovernment ||
      isNgo;

    if (!isCoordinatorPage || !profileStorageKey) {
      return;
    }

    const handleCoordinatorProfileUpload = (event: Event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      const isProfileImageInput =
        input.classList.contains("institutionProfileImageInput") ||
        input.classList.contains("profileImageInput") ||
        input.name === "profileImage" ||
        input.getAttribute("aria-label")?.toLowerCase().includes("profile image");

      if (
        input.type !== "file" ||
        !isProfileImageInput
      ) {
        return;
      }

      const file = input.files?.[0];

      if (!file || !file.type.startsWith("image/")) {
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") {
          return;
        }

        const uploadedProfileImage = reader.result;

        /* Update the shared header immediately.
           This does not depend on localStorage succeeding. */
        setHeaderProfileImage(uploadedProfileImage);

        /* Save separately for this page/profile.
           sessionStorage is used as a fallback if localStorage is full. */
        try {
          localStorage.setItem(
            profileStorageKey,
            uploadedProfileImage
          );
        } catch {
          try {
            sessionStorage.setItem(
              profileStorageKey,
              uploadedProfileImage
            );
          } catch {
            // The live header image still remains updated in memory.
          }
        }

        /* Send the actual uploaded image with the event.
           This prevents the Header from immediately replacing it with
           an empty/old storage value. */
        window.dispatchEvent(
          new CustomEvent("profileImageUpdated", {
            detail: {
              storageKey: profileStorageKey,
              image: uploadedProfileImage,
            },
          })
        );
      };

      reader.readAsDataURL(file);
    };

    document.addEventListener(
      "change",
      handleCoordinatorProfileUpload,
      true
    );

    return () => {
      document.removeEventListener(
        "change",
        handleCoordinatorProfileUpload,
        true
      );
    };
  }, [
    isSuperAdmin,
    isPlatformAdmin,
    isInstitutionAdmin,
    isStudent,
    isStudentUniversity,
    isStudentBootcamp,
    isStudentSkillAcademy,
    isStudentCorporate,
    isStudentGovernment,
    isStudentNgo,
    isFacultyUniversity,
    isFacultySkillAcademy,
    isFacultyBootcamp,
    isFacultyCorporate,
    isFacultyGovernment,
    isFacultyNgo,
    isUniversity,
    isBootcamp,
    isCorporate,
    isGovernment,
    isNgo,
    profileStorageKey,
  ]);

  useEffect(() => {
    document.body.classList.toggle(
      "mobileSidebarOpen",
      isMobileMenuOpen
    );

    return () => {
      document.body.classList.remove(
        "mobileSidebarOpen"
      );
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const studentBreadcrumb =
    STUDENT_ROUTES[normalizedPath] ??
    (() => {
      if (normalizedPath.includes("consent")) {
        return ["Student Profile", "Consent"];
      }

      if (normalizedPath.includes("registration")) {
        return ["Student Profile", "Registration"];
      }

      return [
        "Student Profile",
        "Student Profile",
      ];
    })();

  // Pages render their own breadcrumbs. The shared header never shows the old profile breadcrumb.
  const showSharedHeaderBreadcrumb = false;

  const breadcrumbContent = isStudent ? (
    <>
      {studentBreadcrumb.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="breadcrumbSegment"
        >
          {index > 0 && (
            <Image
              src={arrowRightIcon}
              alt=""
              width={15}
              height={15}
            />
          )}

          <span
            className={
              index === studentBreadcrumb.length - 1
                ? "breadcrumbCurrent"
                : "breadcrumbParent"
            }
          >
            {item}
          </span>
        </span>
      ))}
    </>
  ) : (
    <>
      <span className="breadcrumbParent">{profileTitle}</span>

      <Image
        src={arrowRightIcon}
        alt=""
        width={15}
        height={15}
      />

      <span className="breadcrumbCurrent">{currentPage}</span>
    </>
  );

  return (
    <>
      <header className={`topHeader ${isAssessmentPage ? "topHeaderAssessment" : ""}`}>
        {showSharedHeaderBreadcrumb && !isAssessmentPage && (
          <div className="breadcrumb desktopBreadcrumb">
            {breadcrumbContent}
          </div>
        )}

        <div className="headerRight">
          <button
            type="button"
            className="notificationButton"
            aria-label="Notifications"
          >
            <Image
              src="/assets/assessmenticons/bell.svg"
              alt=""
              width={18}
              height={18}
            />

            <span
              className="notificationDot"
              aria-hidden="true"
            />
          </button>

          <div className="headerDivider" />

          <div className="topUserProfile">
            <div className="smallAvatar">
              {(isViewerPage || !isAssessmentPage || headerProfileImage) && (
                <Image
                  src={isViewerPage ? (headerProfileImage || "/assets/studenticons/profile.png") : isAssessmentPage ? headerProfileImage! : profileImage}
                  alt="User profile"
                  fill
                  sizes="36px"
                  className="avatarImage"
                  unoptimized={isAssessmentPage || profileImage.startsWith("data:")}
                />
              )}
            </div>

            <div className="topUserDetails">
              <h1 className="topUserName">
                {demoUser?.displayName || (isViewerPage ? "Tony Thomas" : isAssessmentPage ? "Antony Thomas" : userName)}
              </h1>

              <div className="topUserRole">
                {demoUser ? (demoUser.role === "admin" ? "Institute Admin" : "Student / Learner") : (isViewerPage ? "Student" : isAssessmentPage ? "Institution admin" : userRole)}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mobileMenuButton"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            onClick={() =>
              setIsMobileMenuOpen(
                (current) => !current
              )
            }
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {showSharedHeaderBreadcrumb && !isAssessmentPage && (
        <div className="breadcrumb mobileBreadcrumb">
          {breadcrumbContent}
        </div>
      )}
    </>
  );
}
