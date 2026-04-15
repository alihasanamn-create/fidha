export const getUserClass = (email) => {
  const map = {
    "teacher1@gmail.com": "10A",
    "teacher2@gmail.com": "9B",
  };

  return map[email] || null;
};