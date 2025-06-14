import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { getUserProfile, hasAchievement, unlockAchievement } from "./userService";

// Get all achievements
export async function getAllAchievements() {
  const snapshot = await getDocs(collection(db, "achievements"));
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      firebaseId: docSnap.id,
      id: data.id ?? docSnap.id,
      ...data
    };
  });
}


export async function getAchievementDetails(achievementId) {
  try {
    // Try to fetch by the stored achievement id field
    const q = query(collection(db, "achievements"), where("id", "==", achievementId));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const docSnap = querySnap.docs[0];
      return { firebaseId: docSnap.id, ...docSnap.data() };
    }

    // Fallback to fetching by document id
    const achievementRef = doc(db, "achievements", achievementId);
    const achievementSnap = await getDoc(achievementRef);

    if (achievementSnap.exists()) {
      return { firebaseId: achievementId, ...achievementSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching achievement details:", error);
    throw error;
  }
}

// 2. Fetch user's unlocked achievement map (from their user doc)
async function getUserAchievementsMap(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().achievements || {};
  }
  return {};
}

// Get user's achievement progress (all achievements with unlock status)
export async function getUserAchievementProgress(userId) {
  try {
    const [allAchievements, userAchievements] = await Promise.all([
      getAllAchievements(),
      getUserAchievementsMap(userId)
    ]);

    return allAchievements.map(achievement => ({
      ...achievement,
      unlocked: achievement.id in userAchievements,
      unlockedAt: userAchievements[achievement.id]?.unlockedAt || null
    }));
  } catch (error) {
    console.error("Error getting achievement progress:", error);
    throw error;
  }
}

// Subscribe to real-time updates of a user's achievement progress
export function subscribeToUserAchievementProgress(userId, callback) {
  const userRef = doc(db, "users", userId);
  return onSnapshot(userRef, async snap => {
    const userAchievements = snap.exists() ? snap.data().achievements || {} : {};
    const allAchievements = await getAllAchievements();
    const progress = allAchievements.map(ach => ({
      ...ach,
      unlocked: ach.id in userAchievements,
      unlockedAt: userAchievements[ach.id]?.unlockedAt || null
    }));
    callback(progress);
  });
}

// Get only unlocked achievements with details
export async function getUserUnlockedAchievements(userId) {
  try {
    const userData = await getUserProfile(userId);
    if (!userData || !userData.achievements) return [];

    const userAchievements = userData.achievements;
    const achievementIds = Object.keys(userAchievements);

    // Get details for each unlocked achievement
    const achievementDetails = await Promise.all(
      achievementIds.map(async (id) => {
        const details = await getAchievementDetails(id);
        return {
          ...details,
          unlockedAt: userAchievements[id].unlockedAt
        };
      })
    );

    return achievementDetails.filter(achievement => achievement !== null);
  } catch (error) {
    console.error("Error getting unlocked achievements:", error);
    return [];
  }
}

// ===== ACHIEVEMENT CHECKING FUNCTIONS =====

// Check and unlock lesson completion achievements
export async function checkLessonAchievements(userId) {
  const results = [];
  
  try {
    // Check "Complete your first lesson" achievement
    const details = await getAchievementDetails("first-lesson");
    const achId = details?.id || "first-lesson";
    const hasFirstLesson = await hasAchievement(userId, achId);
    if (!hasFirstLesson) {
      const result = await unlockAchievement(userId, achId);
      if (!result.alreadyUnlocked) {
        results.push({
          id: achId,
          title: details?.title || "First Lesson",
          description: details?.description || "Complete your first lesson!",
          unlocked: true
        });
      }
    }
  } catch (error) {
    console.error("Error checking lesson achievements:", error);
  }
  
  return results;
}

// Check and unlock course completion achievements
export async function checkCourseAchievements(userId, completedCount) {
  const results = [];
  
  try {
    // First course achievement
    if (completedCount >= 1) {
      const firstCourseDetails = await getAchievementDetails("first-course");
      const firstCourseId = firstCourseDetails?.id || "first-course";
      const hasFirstCourse = await hasAchievement(userId, firstCourseId);
      if (!hasFirstCourse) {
        const result = await unlockAchievement(userId, firstCourseId);
        if (!result.alreadyUnlocked) {
          results.push({
            id: firstCourseId,
            title: firstCourseDetails?.title || "Course Beginner",
            description:
              firstCourseDetails?.description || "Complete your first course!",
            unlocked: true
          });
        }
      }
    }

    // Course master achievement (5 courses)
    if (completedCount >= 5) {
      const masterDetails = await getAchievementDetails("course-master");
      const masterId = masterDetails?.id || "course-master";
      const hasCourseMaster = await hasAchievement(userId, masterId);
      if (!hasCourseMaster) {
        const result = await unlockAchievement(userId, masterId);
        if (!result.alreadyUnlocked) {
          results.push({
            id: masterId,
            title: masterDetails?.title || "Course Master",
            description: masterDetails?.description || "Complete 5 courses!",
            unlocked: true
          });
        }
      }
    }

    // Course legend achievement (10 courses)
    if (completedCount >= 10) {
      const legendDetails = await getAchievementDetails("course-legend");
      const legendId = legendDetails?.id || "course-legend";
      const hasCourseLegend = await hasAchievement(userId, legendId);
      if (!hasCourseLegend) {
        const result = await unlockAchievement(userId, legendId);
        if (!result.alreadyUnlocked) {
          results.push({
            id: legendId,
            title: legendDetails?.title || "Course Legend",
            description: legendDetails?.description || "Complete 10 courses!",
            unlocked: true
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking course achievements:", error);
  }
  
  return results;
}

// Check and unlock streak achievements
export async function checkStreakAchievements(userId, streakCount) {
  const results = [];
  
  try {
    // 3-day streak
    if (streakCount >= 3) {
      const streak3Details = await getAchievementDetails("streak-3");
      const streak3Id = streak3Details?.id || "streak-3";
      const hasStreak3 = await hasAchievement(userId, streak3Id);
      if (!hasStreak3) {
        const result = await unlockAchievement(userId, streak3Id);
        if (!result.alreadyUnlocked) {
          results.push({
            id: streak3Id,
            title: streak3Details?.title || "On Fire!",
            description:
              streak3Details?.description ||
              "Maintain a 3-day learning streak!",
            unlocked: true
          });
        }
      }
    }

    // 7-day streak
    if (streakCount >= 7) {
      const streak7Details = await getAchievementDetails("streak-7");
      const streak7Id = streak7Details?.id || "streak-7";
      const hasStreak7 = await hasAchievement(userId, streak7Id);
      if (!hasStreak7) {
        const result = await unlockAchievement(userId, streak7Id);
        if (!result.alreadyUnlocked) {
          results.push({
            id: streak7Id,
            title: streak7Details?.title || "Week Warrior",
            description:
              streak7Details?.description ||
              "Maintain a 7-day learning streak!",
            unlocked: true
          });
        }
      }
    }

    // 30-day streak
    if (streakCount >= 30) {
      const streak30Details = await getAchievementDetails("streak-30");
      const streak30Id = streak30Details?.id || "streak-30";
      const hasStreak30 = await hasAchievement(userId, streak30Id);
      if (!hasStreak30) {
        const result = await unlockAchievement(userId, streak30Id);
        if (!result.alreadyUnlocked) {
          results.push({
            id: streak30Id,
            title: streak30Details?.title || "Dedication Master",
            description:
              streak30Details?.description ||
              "Maintain a 30-day learning streak!",
            unlocked: true
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking streak achievements:", error);
  }
  
  return results;
}

// Check and unlock level achievements
export async function checkLevelAchievements(userId, userLevel) {
  const results = [];
  
  try {
    // Level 5 achievement
    if (userLevel >= 5) {
      const level5Details = await getAchievementDetails("level-5");
      const level5Id = level5Details?.id || "level-5";
      const hasLevel5 = await hasAchievement(userId, level5Id);
      if (!hasLevel5) {
        const result = await unlockAchievement(userId, level5Id);
        if (!result.alreadyUnlocked) {
          results.push({
            id: level5Id,
            title: level5Details?.title || "Rising Star",
            description: level5Details?.description || "Reach level 5!",
            unlocked: true
          });
        }
      }
    }

    // Level 10 achievement
    if (userLevel >= 10) {
      const level10Details = await getAchievementDetails("level-10");
      const level10Id = level10Details?.id || "level-10";
      const hasLevel10 = await hasAchievement(userId, level10Id);
      if (!hasLevel10) {
        const result = await unlockAchievement(userId, level10Id);
        if (!result.alreadyUnlocked) {
          results.push({
            id: level10Id,
            title: level10Details?.title || "Expert Learner",
            description: level10Details?.description || "Reach level 10!",
            unlocked: true
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking level achievements:", error);
  }
  
  return results;
}

// Check profile completion achievement
export async function checkProfileAchievement(userId) {
  const results = [];
  
  try {
    const details = await getAchievementDetails("profile-complete");
    const achId = details?.id || "profile-complete";
    const hasProfileComplete = await hasAchievement(userId, achId);
    if (!hasProfileComplete) {
      const result = await unlockAchievement(userId, achId);
      if (!result.alreadyUnlocked) {
        results.push({
          id: achId,
          title: details?.title || "Known Legend",
          description: details?.description || "Complete Profile",
          unlocked: true
        });
      }
    }
  } catch (error) {
    console.error("Error checking profile achievement:", error);
  }
  
  return results;
}

// Master function to check all achievements at once
export async function checkAllAchievements(userId) {
  try {
    const userData = await getUserProfile(userId);
    if (!userData) return [];

    const completedCourses = userData.completedCourses?.length || 0;
    const streak = userData.streak || 0;
    const level = userData.level || 1;
    const profileComplete = userData.profileComplete || false;

    const allNewAchievements = [];

    // Check all achievement types
    const [lessonAchievements, courseAchievements, streakAchievements, levelAchievements] = await Promise.all([
      checkLessonAchievements(userId),
      checkCourseAchievements(userId, completedCourses),
      checkStreakAchievements(userId, streak),
      checkLevelAchievements(userId, level)
    ]);

    allNewAchievements.push(...lessonAchievements, ...courseAchievements, ...streakAchievements, ...levelAchievements);

    // Check profile achievement if profile is complete
    if (profileComplete) {
      const profileAchievements = await checkProfileAchievement(userId);
      allNewAchievements.push(...profileAchievements);
    }

    return allNewAchievements;
  } catch (error) {
    console.error("Error checking all achievements:", error);
    return [];
  }
}
