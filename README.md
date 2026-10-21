# เว็บเครดิตร้าน ZEMBAE (GitHub Pages + Firebase)

ไฟล์: index.html (หน้าสาธารณะ), admin.html (แอดมิน), app.js, admin.js, style.css, firebase-config.js, firestore.rules

## ตั้งค่า Firebase (ฟรี ไม่ต้องผูกบัตร)
1. console.firebase.google.com > สร้างโปรเจกต์ (หรือใช้โปรเจกต์เดิมของวิดเจ็ตรีวิว)
2. Build > Firestore Database > Create database (โหมด production) 
3. Build > Authentication > Sign-in method > เปิด Email/Password แล้วที่แท็บ Users กด Add user ใส่อีเมลกับรหัสผ่านของ ZEMBAE
4. Project settings > Your apps > เพิ่มเว็บแอป (</>) แล้วคัดลอก firebaseConfig ไปวางใน firebase-config.js
5. Firestore > Rules > วางเนื้อหา firestore.rules โดยแก้ YOUR_EMAIL@example.com เป็นอีเมลแอดมินจริง แล้วกด Publish

## ขึ้น GitHub Pages
1. สร้าง repo ใหม่ อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้
2. Settings > Pages > Deploy from a branch > main / root
3. Firebase > Authentication > Settings > Authorized domains > เพิ่ม USERNAME.github.io
4. เปิด https://USERNAME.github.io/REPO/admin.html เพื่อลงเครดิต

## หมายเหตุ
- ไม่ใช้ Firebase Storage (โปรเจกต์ใหม่ต้องผูกบัตร) รูปถูกย่อแล้วเก็บใน Firestore: ภาพย่อในรายการ ภาพเต็มโหลดตอนกดดู
- เบลอทำลงพิกเซลของรูปก่อนอัปโหลด ข้อมูลลูกค้าใต้กรอบเบลอไม่หลุดไปกับไฟล์
- ใครก็อ่านข้อมูลได้ แต่เขียนได้เฉพาะอีเมลแอดมินตามกฎ
