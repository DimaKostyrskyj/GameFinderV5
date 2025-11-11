import bcrypt from 'bcrypt';

async function generateHash() {
  const passwords = {
    Kai: 'KaiSatto3188',
    Kingo: '25802006Vk.',
    Very: 'jG8PEeuuF%HAG2FtP1zesZoYh3IY#$oD'
  };

  console.log('🔐 Generating password hashes...\n');

  for (const [user, pass] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(pass, 10);
    console.log(`ADMIN_HASH_${user}=${hash}`);
  }

  console.log('\n✅ Copy these to your .env file');
}

generateHash().catch(console.error);