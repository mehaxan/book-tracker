# "AWS for Everything" Deployment Guide: Lumina Read

This guide sets up your entire stack (**Frontend + Backend API + MongoDB Database**) directly on **Amazon Web Services (AWS)** under **`book.mehaxan.com`**.

---

## 🏗️ Architecture on AWS

All 3 components run securely inside an **AWS EC2** instance (or Lightsail) using Docker Compose:

```
User (Browser)
   │
   ▼ (HTTPS)
Cloudflare Edge Proxy (book.mehaxan.com)
   │
   ▼ (Proxied HTTP on Port 80)
AWS EC2 Instance (Elastic IP)
   ├── 🖥️ Frontend: Nginx Container (Port 80)
   ├── ⚙️ Backend: Node.js Express Container (Port 5000)
   └── 🗄️ Database: MongoDB Container with persistent AWS EBS Volume (mongo-data)
```

**Benefits of this setup:**
- **All in AWS**: Zero third-party database subscriptions required.
- **Persistent Data**: MongoDB data is stored on an AWS EBS drive attached to your instance.
- **1-Command Setup**: Docker Compose boots the database, server, and web client automatically.
- **Free Tier Eligible**: Runs 100% within the AWS Free Tier (`t2.micro` or `t3.micro`).

---

## Step 1: Launch Your AWS EC2 Instance

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **EC2** > **Instances** > Click **Launch an instance**.
3. **Name**: `lumina-book-tracker`
4. **Application and OS Images (AMI)**:
   - Select **Ubuntu** (Choose **Ubuntu Server 24.04 LTS** or **22.04 LTS**, 64-bit x86).
5. **Instance Type**:
   - Select **`t2.micro`** or **`t3.micro`** (Free Tier eligible: 750 hours/month free).
6. **Key Pair (login)**:
   - Click **Create new key pair**.
   - Name: `lumina-aws-key`
   - Key pair type: **RSA**, format: **`.pem`**.
   - Download and save the `.pem` file to your Mac (e.g. in `~/.ssh/lumina-aws-key.pem`).
7. **Network Settings (Security Group)**:
   Check these boxes:
   - ✅ **Allow SSH traffic from**: Select **My IP**
   - ✅ **Allow HTTP traffic from the internet** (Port 80)
   - ✅ **Allow HTTPS traffic from the internet** (Port 443)
8. **Storage**:
   - Default 8 GB or 20 GB gp3 SSD (Free tier includes up to 30 GB EBS).
9. Click **Launch Instance**.

---

## Step 2: Assign an AWS Elastic IP (Static Public IP)

By default, an EC2 public IP changes whenever the instance stops. An Elastic IP makes it permanent so your Cloudflare DNS never breaks:

1. In the left menu of the EC2 console, go to **Network & Security > Elastic IPs**.
2. Click **Allocate Elastic IP address** > Click **Allocate**.
3. Select your newly created Elastic IP > Click **Actions > Associate Elastic IP address**.
4. Choose **Instance**, select your `lumina-book-tracker` instance, and click **Associate**.
5. Copy your **Allocated IPv4 address** (e.g., `3.120.45.67`).

---

## Step 3: Configure Cloudflare DNS for `book.mehaxan.com`

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/) and select **`mehaxan.com`**.
2. Click **DNS > Records** > Click **Add record**:
   - **Type**: `A`
   - **Name**: `book`
   - **IPv4 address**: `<YOUR_AWS_ELASTIC_IP>`
   - **Proxy status**: **Proxied (Orange cloud enabled)**
   - Click **Save**.
3. In Cloudflare, go to **SSL/TLS > Overview**:
   - Set encryption mode to **Full** (or **Flexible**).
   - *Cloudflare now handles global HTTPS encryption for `https://book.mehaxan.com`.*

---

## Step 4: Deploy to Your AWS Instance

### 4.1 Set permissions for your downloaded `.pem` key
In your Mac terminal:
```bash
chmod 400 ~/.ssh/lumina-aws-key.pem
```

### 4.2 Connect to your AWS instance
```bash
ssh -i ~/.ssh/lumina-aws-key.pem ubuntu@<YOUR_AWS_ELASTIC_IP>
```

### 4.3 Copy your project to AWS
From your Mac terminal (in another terminal tab), run:
```bash
rsync -avz -e "ssh -i ~/.ssh/lumina-aws-key.pem" --exclude 'node_modules' --exclude 'dist' /Users/bs01004/.gemini/antigravity-ide/scratch/book-tracker-app/ ubuntu@<YOUR_AWS_ELASTIC_IP>:~/book-tracker-app/
```

### 4.4 Run 1-command deploy on AWS
Back inside your AWS SSH terminal session:
```bash
cd ~/book-tracker-app
./deploy.sh
```

The script will:
- Install Docker & Docker Compose if missing.
- Launch the **MongoDB 7 database container** with persistent storage volume.
- Build and launch the **Express REST API container**.
- Build and launch the **Nginx Frontend container**.

---

## Step 5: Test & Verify

Open your browser and visit:
👉 **`https://book.mehaxan.com`**

You will see:
- **Lumina Read** live on your custom domain!
- Live database indicator: **`🟢 MongoDB Atlas / AWS`**
- All reading progress, book additions, and analytics saved permanently to your AWS instance.

---

## Useful AWS Maintenance Commands

- **Check container status**:
  ```bash
  docker compose ps
  ```
- **View live server & database logs**:
  ```bash
  docker compose logs -f
  ```
- **Restart services**:
  ```bash
  docker compose restart
  ```
- **Backup MongoDB data**:
  ```bash
  docker compose exec mongodb mongodump --out /data/db/backup
  ```
