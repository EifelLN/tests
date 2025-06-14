import { db } from "./firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getUserProfile, hasAchievement, unlockAchievement } from "./userService";

// Get all achievements
export async function getAllAchievements() {
  const snapshot = await getDocs(collection(db, "achievements"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}


export async function getAchievementDetails(achievementId) {
  try {
    const achievementRef = doc(db, "achievements", achievementId);
    const achievementSnap = await getDoc(achievementRef);
    
    if (achievementSnap.exists()) {
      return { id: achievementId, ...achievementSnap.data() };
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
    const hasFirstLesson = await hasAchievement(userId, "first-lesson");
    if (!hasFirstLesson) {
      const result = await unlockAchievement(userId, "first-lesson");
      if (!result.alreadyUnlocked) {
        results.push({ 
          id: "first-lesson", 
          title: "First Lesson",
          description: "Complete your first lesson!",
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
      const hasFirstCourse = await hasAchievement(userId, "first-course");
      if (!hasFirstCourse) {
        const result = await unlockAchievement(userId, "first-course");
        if (!result.alreadyUnlocked) {
          results.push({
            id: "first-course",
            title: "Course Beginner", 
            description: "Complete your first course!",
            unlocked: true
          });
        }
      }
    }

    // Course master achievement (5 courses)
    if (completedCount >= 5) {
      const hasCourseMaster = await hasAchievement(userId, "course-master");
      if (!hasCourseMaster) {
        const result = await unlockAchievement(userId, "course-master");
        if (!result.alreadyUnlocked) {
          results.push({
            id: "course-master",
            title: "Course Master",
            description: "Complete 5 courses!",
            unlocked: true
          });
        }
      }
    }

    // Course legend achievement (10 courses)
    if (completedCount >= 10) {
      const hasCourseLegend = await hasAchievement(userId, "course-legend");
      if (!hasCourseLegend) {
        const result = await unlockAchievement(userId, "course-legend");
        if (!result.alreadyUnlocked) {
          results.push({
            id: "course-legend",
            title: "Course Legend",
            description: "Complete 10 courses!",
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
      const hasStreak3 = await hasAchievement(userId, "streak-3");
      if (!hasStreak3) {
        const result = await unlockAchievement(userId, "streak-3");
        if (!result.alreadyUnlocked) {
          results.push({
            id: "streak-3",
            title: "On Fire!",
            description: "Maintain a 3-day learning streak!",
            unlocked: true
          });
        }
      }
    }

    // 7-day streak
    if (streakCount >= 7) {
      const hasStreak7 = await hasAchievement(userId, "streak-7");
      if (!hasStreak7) {
        const result = await unlockAchievement(userId, "streak-7");
        if (!result.alreadyUnlocked) {
          results.push({
            id: "streak-7",
            title: "Week Warrior",
            description: "Maintain a 7-day learning streak!",
            unlocked: true
          });
        }
      }
    }

    // 30-day streak
    if (streakCount >= 30) {
      const hasStreak30 = await hasAchievement(userId, "streak-30");
      if (!hasStreak30) {
        const result = await unlockAchievement(userId, "streak-30");
        if (!result.alreadyUnlocked) {
          results.push({
            id: "streak-30",
            title: "Dedication Master",
            description: "Maintain a 30-day learning streak!",
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
      const hasLevel5 = await hasAchievement(userId, "level-5");
      if (!hasLevel5) {
        const result = await unlockAchievement(userId, "level-5");
        if (!result.alreadyUnlocked) {
          results.push({
            id: "level-5",
            title: "Rising Star",
            description: "Reach level 5!",
            unlocked: true
          });
        }
      }
    }

    // Level 10 achievement
    if (userLevel >= 10) {
      const hasLevel10 = await hasAchievement(userId, "level-10");
      if (!hasLevel10) {
        const result = await unlockAchievement(userId, "level-10");
        if (!result.alreadyUnlocked) {
          results.push({
            id: "level-10",
            title: "Expert Learner",
            description: "Reach level 10!",
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
    const hasProfileComplete = await hasAchievement(userId, "profile-complete");
    if (!hasProfileComplete) {
      const result = await unlockAchievement(userId, "profile-complete");
      if (!result.alreadyUnlocked) {
        results.push({
          id: "profile-complete",
          title: "Known Legend",
          description: "Complete Profile",
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