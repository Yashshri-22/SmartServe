function calculateMatchScore(volunteer, ngo) {
  let score = 0;
  let reasons = [];

  const vSkills = volunteer.ai_skills || [];
  const nNeeds = ngo.ai_needs || [];

  // 🔹 Skill match (60%)
  const commonSkills = vSkills.filter(skill =>
    nNeeds.includes(skill)
  );

  if (commonSkills.length > 0) {
    score += Math.min(commonSkills.length * 30, 60);
    reasons.push(
      `Skill match: ${commonSkills.join(", ")}`
    );
  }

  // 🔹 Availability / duration (20%)
  if (volunteer.availability && ngo.duration) {
    score += 20;
    reasons.push("Availability aligns with project duration");
  }

  // 🔹 Location match (20%)
  if (
    volunteer.location &&
    ngo.location &&
    volunteer.location.toLowerCase() === ngo.location.toLowerCase()
  ) {
    score += 20;
    reasons.push("Same location");
  }

  return {
    score: Math.min(score, 100),
    explanation: reasons.join(". ")
  };
}

module.exports = calculateMatchScore;
