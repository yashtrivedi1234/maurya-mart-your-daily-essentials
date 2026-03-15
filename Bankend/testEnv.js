import "dotenv/config";
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);
console.log("PASSWORD LENGTH:", process.env.ADMIN_PASSWORD?.length);
