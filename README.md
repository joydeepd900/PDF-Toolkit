# **PDF Toolkit v3.0 (Web) & v2.6 (Legacy) 📄**

A professional, full-stack PDF management suite. Originally born as a local Python utility, now re-engineered into a modern, decoupled web application.

## **🌟 Modern Web Version (v3.0)**

The latest version of PDF Toolkit is now a cloud-based web application, offering a sleek UI and high-speed processing without requiring any local installation.

* **Frontend:** React \+ Vite \+ Tailwind CSS (Hosted on Vercel)  
* **Backend:** FastAPI \+ PyMuPDF \+ pypdf (Hosted on AWS EC2)  
* **Security:** Files are processed in memory on a secure Linux server and never stored permanently.

### **🚀 Live Demo**

[**View the Web App**](https://pdf-toolkit-joy.vercel.app) 

## **💾 Legacy Desktop Version (v2.6)**

For users who prefer offline processing or need to handle sensitive documents entirely on their local machine, the original Python desktop version is preserved in the legacy\_archive/ folder.

### **Key Desktop Features**

* **Privacy:** Runs 100% locally with no internet required.  
* **Universal Merge:** Combine PDFs and Images (JPG/PNG) into one document.  
* **Encryption:** Secure documents with AES-128 password protection.  
* **Extraction:** RIP images or text directly out of PDF binaries.  
* **Native UI:** Familiar OS file/folder selection dialogs via Tkinter.

## **🛠️ Tech Stack & Architecture**

### **Web (Current)**

* **Frontend:** React.js, Lucide Icons, Framer Motion.  
* **Backend:** Python 3.10+, FastAPI, Uvicorn.  
* **DevOps:** GitHub Actions, Vercel (Frontend), AWS EC2 (Backend).

### **Desktop (Archive)**

* **Libraries:** pypdf, PyMuPDF (fitz), Pillow, Tkinter.

## **📥 Getting Started (For Developers)**

### **1\. Clone the Repo**

git clone \[https://github.com/joydeepd900/PDF-Toolkit.git\](https://github.com/joydeepd900/PDF-Toolkit.git)

### **2\. Frontend Setup (React)**

cd frontend  
npm install  
npm run dev

### **3\. Backend Setup (FastAPI)**

cd backend  
python \-m venv venv  
source venv/bin/activate \# Windows: venv\\Scripts\\activate  
pip install \-r requirements.txt  
uvicorn main:app \--reload

## **📁 Repository Structure**

* frontend/: The React web application.  
* backend/: The FastAPI Python server.  
* legacy\_archive/: Contains original v2.5 and v2.6 Python scripts and manuals.

*Created by [Joydeepd900](https://github.com/joydeepd900)*
