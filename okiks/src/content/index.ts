import type { Course, Profile } from "../engine/types";
import { indexCourse, type CourseIndex } from "../engine/session/courseIndex";
import { kidsCourse } from "./en/kids";
import { adultCourse } from "./en/adult";
import { proCourse } from "./en/pro";

export const COURSES: Record<Profile, Course> = { kids: kidsCourse, adult: adultCourse, pro: proCourse };

const indexes = new Map<Profile, CourseIndex>();

export function courseIndex(profile: Profile): CourseIndex {
  let idx = indexes.get(profile);
  if (!idx) {
    idx = indexCourse(COURSES[profile]);
    indexes.set(profile, idx);
  }
  return idx;
}
