import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc, increment, arrayUnion} from "firebase/firestore";

export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  const docRef = doc(db, "users", user.uid);
  await updateDoc(docRef, data);
}

// Calculate level from experience
function calculateLevel(exp) {
  return Math.floor(Math.sqrt(exp / 100)) + 1;
}

export async function checkLevelUp(userId) {
  try {
    const userData = await getUserProfile(userId);
    if (!userData) return { leveledUp: false };
    
    const newLevel = calculateLevel(userData.exp);
    
    if (newLevel > userData.level) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        level: newLevel
      });
      
      console.log(`User ${userId} leveled up to level ${newLevel}!`);
      return { leveledUp: true, newLevel, oldLevel: userData.level };
    }
    
    return { leveledUp: false, currentLevel: userData.level };
  } catch (error) {
    console.error("Error checking level up:", error);
    return { leveledUp: false };
  }
}

export async function addUserExp(userId, amount) {
  try{
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {exp: increment(amount)});
    const levelResult = await checkLevelUp(userId);
    console.log(`Added ${amount} XP to user ${userId}`);
    return levelResult;
  } catch (error){
    console.error("Error adding experience:", error);
    throw error;
  }
}

// Get experience needed for next level
export async function getExpToNextLevel(userId) {
  try {
    const userData = await getUserProfile(userId);
    if (!userData) return 0;
    
    const currentLevel = userData.level;
    const expForNextLevel = Math.pow(currentLevel, 2) * 100;
    const expNeeded = expForNextLevel - userData.exp;
    
    return Math.max(0, expNeeded);
  } catch (error) {
    console.error("Error calculating exp to next level:", error);
    return 0;
  }
}

// Check if course is completed
export async function isCourseCompleted(userId, courseId) {
  try {
    const userData = await getUserProfile(userId);
    if (!userData) return false;
    
    const completedCourses = userData.completedCourses || [];
    return completedCourses.includes(courseId);
  } catch (error) {
    console.error("Error checking course completion:", error);
    return false;
  }
}

export async function completeCourse(userId, courseId, expReward = 50) {
  try {
    if (await isCourseCompleted(userId, courseId)) {
      return { alreadyCompleted: true };
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      completedCourses: arrayUnion(courseId)
    });
    
    const levelResult = await addUserExp(userId, expReward);
    
    console.log(`Course ${courseId} completed for user ${userId}`);
    return { 
      alreadyCompleted: false, 
      expGained: expReward,
      levelResult 
    };
  } catch (error) {
    console.error("Error completing course:", error);
    throw error;
  }
}

// Get completed courses
export async function getUserCompletedCourses(userId) {
  try {
    const userData = await getUserProfile(userId);
    return userData?.completedCourses || [];
  } catch (error) {
    console.error("Error fetching completed courses:", error);
    return [];
  }
}

// ===== USER PROFILE FUNCTIONS =====

// Get user data
export async function getUserData(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userId, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// Check if profile is complete
export async function isProfileComplete(userId) {
  try {
    const userData = await getUserData(userId);
    return userData?.profileComplete || false;
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
}

// Get completion count
export async function getCompletionCount(userId) {
  try {
    const completedCourses = await getUserCompletedCourses(userId);
    return completedCourses.length;
  } catch (error) {
    console.error("Error getting completion count:", error);
    return 0;
  }
}

export async function incrementCompletedCourses(userId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { completedCourses: increment(1) });
}

// Update streak
export async function updateStreak(userId) {
  try {
    const userData = await getUserData(userId);
    if (!userData) return { streak: 0, streakChanged: false };
    
    const today = new Date().toDateString();
    const lastActive = userData.lastActiveDate;
    
    let newStreak = userData.streak || 0;
    
    if (lastActive) {
      const lastActiveDate = new Date(lastActive).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastActiveDate === today) {
        return { streak: newStreak, streakChanged: false };
      } else if (lastActiveDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      streak: newStreak,
      lastActiveDate: today
    });
    
    console.log(`Streak updated for user ${userId}: ${newStreak} days`);
    return { streak: newStreak, streakChanged: true };
  } catch (error) {
    console.error("Error updating streak:", error);
    return { streak: 0, streakChanged: false };
  }
}

// Get user streak
export async function getUserStreak(userId) {
  try {
    const userData = await getUserData(userId);
    return userData?.streak || 0;
  } catch (error) {
    console.error("Error getting user streak:", error);
    return 0;
  }
}

// Unlock achievement
export async function unlockAchievement(userId, achievementId) {
  try {
    if (await hasAchievement(userId, achievementId)) {
      return { alreadyUnlocked: true };
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      [`achievements.${achievementId}`]: {
        unlockedAt: Date.now()
      }
    });
    
    console.log(`Achievement ${achievementId} unlocked for user ${userId}`);
    return { alreadyUnlocked: false };
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    throw error;
  }
}

// Check if user has achievement
export async function hasAchievement(userId, achievementId) {
  try {
    const userData = await getUserData(userId);
    if (!userData) return false;
    
    const achievements = userData.achievements || {};
    return achievementId in achievements;
  } catch (error) {
    console.error("Error checking achievement:", error);
    return false;
  }
}

// Get user achievements
export async function getUserAchievements(userId) {
  try {
    const userData = await getUserData(userId);
    return userData?.achievements || {};
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return {};
  }
}

// Get comprehensive user stats
export async function getUserStats(userId) {
  try {
    const userData = await getUserData(userId);
    if (!userData) return null;
    
    const completedCoursesCount = userData.completedCourses?.length || 0;
    const achievementsCount = Object.keys(userData.achievements || {}).length;
    const expToNext = await getExpToNextLevel(userId);
    
    return {
      level: userData.level || 1,
      exp: userData.exp || 0,
      expToNextLevel: expToNext,
      streak: userData.streak || 0,
      completedCourses: completedCoursesCount,
      totalAchievements: achievementsCount,
      profileComplete: userData.profileComplete || false,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      country: userData.country || "",
      institution: userData.institution || ""
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
}