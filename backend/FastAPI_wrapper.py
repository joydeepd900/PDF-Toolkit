import os
import shutil
import tempfile
import sys
import subprocess
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from pypdf import PdfWriter, PdfReader
from PIL import Image
import fitz  # PyMuPDF

# ── Global Configuration ──────────────────────────────────────────────────────
MAX_FILE_SIZE_MB = 35                          # Maximum allowed upload size in MB
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Initialize FastAPI App
app = FastAPI(title="PDF Toolkit API", version="3.1")


# ── Payload Size Limit Middleware ─────────────────────────────────────────────
class FileSizeLimitMiddleware(BaseHTTPMiddleware):
    """Rejects any request whose Content-Length exceeds MAX_FILE_SIZE_BYTES."""

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_FILE_SIZE_BYTES:
            return Response(
                content=f'{{"detail": "Payload Too Large. Maximum allowed size is {MAX_FILE_SIZE_MB}MB."}}'.encode(),
                status_code=413,
                media_type="application/json",
            )
        return await call_next(request)


# Register middleware — order matters: CORS must wrap everything, size-check comes next
app.add_middleware(FileSizeLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pdf-toolkit-joy.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# --- HELPER FUNCTIONS ---

@app.get("/api/pick-folder")
def pick_folder():
    """Opens a native OS folder dialog (via isolated process) and returns the selected path."""
    script = (
        "import tkinter as tk; from tkinter import filedialog; "
        "root = tk.Tk(); root.withdraw(); root.attributes('-topmost', True); "
        "print(filedialog.askdirectory(parent=root, title='Select Output Directory'))"
    )
    # Run in a separate process to prevent any async/thread tkinter crashes in Uvicorn
    result = subprocess.run([sys.executable, "-c", script], capture_output=True, text=True)
    return {"path": result.stdout.strip()}

def save_upload_to_temp(upload_file: UploadFile, temp_dir: str) -> str:
    """Saves an uploaded file to a temporary directory and returns the path."""
    file_path = os.path.join(temp_dir, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path


def strip_metadata_from_writer(writer: PdfWriter) -> PdfWriter:
    """Strips all metadata from a PdfWriter by setting an empty metadata dict."""
    writer.add_metadata({})
    return writer


def finalize_response(output_path: str, media_type: str, filename: str, output_dir: str):
    """
    Returns a FileResponse for download, OR saves the file to output_dir and
    returns a JSON confirmation if output_dir is a valid directory path.
    """
    if output_dir and output_dir.strip() and os.path.isdir(output_dir.strip()):
        dest_path = os.path.join(output_dir.strip(), filename)
        shutil.copy2(output_path, dest_path)
        return JSONResponse({"saved": True, "path": dest_path, "filename": filename})
    return FileResponse(output_path, media_type=media_type, filename=filename)


# --- API ENDPOINTS ---

@app.post("/api/merge")
async def universal_merge(
    files: List[UploadFile] = File(...),
    strip_metadata: bool = Form(False),
    output_dir: str = Form(None),
):
    """1. Merges PDFs and Images together into one file."""
    temp_dir = tempfile.mkdtemp()
    output_path = os.path.join(temp_dir, "merged_output.pdf")
    filename = "merged_output.pdf"

    try:
        merger = PdfWriter()
        for upload_file in files:
            file_path = save_upload_to_temp(upload_file, temp_dir)

            if file_path.lower().endswith('.pdf'):
                merger.append(file_path)
            elif file_path.lower().endswith(('.jpg', '.jpeg', '.png')):
                img = Image.open(file_path).convert('RGB')
                temp_pdf_path = f"{file_path}_temp.pdf"
                img.save(temp_pdf_path)
                merger.append(temp_pdf_path)

        if strip_metadata:
            strip_metadata_from_writer(merger)

        merger.write(output_path)
        merger.close()
        return finalize_response(output_path, "application/pdf", filename, output_dir)
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/extract-pages")
async def extract_pages(
    file: UploadFile = File(...),
    start_page: int = Form(...),
    end_page: int = Form(...),
    strip_metadata: bool = Form(False),
    output_dir: str = Form(None),
):
    """2. Extracts a specific range of pages (e.g., 3-5) into a new file."""
    temp_dir = tempfile.mkdtemp()
    file_path = save_upload_to_temp(file, temp_dir)
    base_name = os.path.splitext(file.filename)[0]
    filename = f"{base_name}_pages_{start_page}-{end_page}.pdf"
    output_path = os.path.join(temp_dir, filename)

    try:
        reader = PdfReader(file_path)
        writer = PdfWriter()

        # Validation
        if start_page < 1 or end_page > len(reader.pages) or start_page > end_page:
            return {"error": "Invalid page range."}

        for i in range(start_page - 1, end_page):
            writer.add_page(reader.pages[i])

        if strip_metadata:
            strip_metadata_from_writer(writer)

        with open(output_path, "wb") as out_file:
            writer.write(out_file)

        return finalize_response(output_path, "application/pdf", filename, output_dir)
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/split")
async def split_pdf(file: UploadFile = File(...)):
    """3. Separates a single PDF into individual files for each page (Returns a ZIP)."""
    temp_dir = tempfile.mkdtemp()
    file_path = save_upload_to_temp(file, temp_dir)
    output_dir = os.path.join(temp_dir, "split_pages")
    os.makedirs(output_dir, exist_ok=True)

    try:
        reader = PdfReader(file_path)
        base_name = os.path.splitext(file.filename)[0]

        for i, page in enumerate(reader.pages):
            writer = PdfWriter()
            writer.add_page(page)
            output_filename = os.path.join(output_dir, f"{base_name}_page_{i+1}.pdf")
            with open(output_filename, "wb") as out_file:
                writer.write(out_file)

        zip_path = os.path.join(temp_dir, "split_pages_archive")
        shutil.make_archive(zip_path, 'zip', output_dir)
        return FileResponse(f"{zip_path}.zip", media_type="application/zip", filename=f"{base_name}_split.zip")
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/images-to-pdf")
async def images_to_pdf(
    files: List[UploadFile] = File(...),
    strip_metadata: bool = Form(False),
    output_dir: str = Form(None),
):
    """4. Converts a selection of images (JPG/PNG) into a single PDF."""
    temp_dir = tempfile.mkdtemp()
    output_path = os.path.join(temp_dir, "converted_images.pdf")
    filename = "converted_images.pdf"

    try:
        img_list = []
        first_image = None

        for i, upload_file in enumerate(files):
            file_path = save_upload_to_temp(upload_file, temp_dir)
            img = Image.open(file_path).convert('RGB')
            if i == 0:
                first_image = img
            else:
                img_list.append(img)

        if first_image:
            first_image.save(output_path, save_all=True, append_images=img_list)

            # Strip metadata via PdfWriter round-trip if requested
            if strip_metadata:
                stripped_path = os.path.join(temp_dir, "converted_images_clean.pdf")
                reader = PdfReader(output_path)
                writer = PdfWriter()
                for page in reader.pages:
                    writer.add_page(page)
                strip_metadata_from_writer(writer)
                with open(stripped_path, "wb") as f:
                    writer.write(f)
                output_path = stripped_path

            return finalize_response(output_path, "application/pdf", filename, output_dir)
        return {"error": "No images provided"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/lock")
async def lock_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
    strip_metadata: bool = Form(False),
    output_dir: str = Form(None),
):
    """5. Encrypts a PDF file with a user-provided password."""
    temp_dir = tempfile.mkdtemp()
    file_path = save_upload_to_temp(file, temp_dir)
    base_name = os.path.splitext(file.filename)[0]
    filename = f"{base_name}-encrypted.pdf"
    output_path = os.path.join(temp_dir, filename)

    try:
        reader = PdfReader(file_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        if strip_metadata:
            strip_metadata_from_writer(writer)

        writer.encrypt(password)
        with open(output_path, "wb") as out_file:
            writer.write(out_file)

        return finalize_response(output_path, "application/pdf", filename, output_dir)
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/strip-metadata")
async def strip_metadata_endpoint(file: UploadFile = File(...)):
    """6. Removes hidden data (Author, Creator, Date) from the PDF."""
    temp_dir = tempfile.mkdtemp()
    file_path = save_upload_to_temp(file, temp_dir)
    base_name = os.path.splitext(file.filename)[0]
    output_path = os.path.join(temp_dir, f"{base_name}_clean.pdf")

    try:
        reader = PdfReader(file_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.add_metadata({})  # Empty dict strips metadata

        with open(output_path, "wb") as out_file:
            writer.write(out_file)

        return FileResponse(output_path, media_type="application/pdf", filename=f"{base_name}_clean.pdf")
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """7. Extracts all text from a PDF and saves it as a .txt file."""
    temp_dir = tempfile.mkdtemp()
    file_path = save_upload_to_temp(file, temp_dir)
    output_path = os.path.join(temp_dir, "extracted_text.txt")

    try:
        reader = PdfReader(file_path)
        with open(output_path, "w", encoding="utf-8") as text_file:
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    text_file.write(f"--- Page {i+1} ---\n{text}\n\n")

        return FileResponse(output_path, media_type="text/plain", filename="extracted_text.txt")
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/pdf-to-images")
async def pdf_to_images(
    file: UploadFile = File(...),
    matrix_scale: float = Form(2.0),
):
    """8. Converts entire PDF pages into images (Returns a ZIP)."""
    temp_dir = tempfile.mkdtemp()
    file_path = save_upload_to_temp(file, temp_dir)
    base_name = os.path.splitext(file.filename)[0]
    output_dir = os.path.join(temp_dir, f"{base_name}_rendered_images")
    os.makedirs(output_dir, exist_ok=True)

    try:
        doc = fitz.open(file_path)
        for i, page in enumerate(doc):
            matrix = fitz.Matrix(matrix_scale, matrix_scale)
            pix = page.get_pixmap(matrix=matrix)
            output_filename = os.path.join(output_dir, f"Page_{i+1}.png")
            pix.save(output_filename)

        zip_path = os.path.join(temp_dir, "rendered_pages_archive")
        shutil.make_archive(zip_path, 'zip', output_dir)
        return FileResponse(f"{zip_path}.zip", media_type="application/zip", filename=f"{base_name}_rendered_images.zip")
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/extract-images")
async def extract_images_from_pdf(file: UploadFile = File(...)):
    """9. Finds and saves all images embedded inside a PDF (Returns a ZIP)."""
    temp_dir = tempfile.mkdtemp()
    file_path = save_upload_to_temp(file, temp_dir)
    base_name = os.path.splitext(file.filename)[0]
    output_dir = os.path.join(temp_dir, f"{base_name}_extracted_images")
    os.makedirs(output_dir, exist_ok=True)

    try:
        reader = PdfReader(file_path)
        count = 0
        for i, page in enumerate(reader.pages):
            for image_file in page.images:
                output_filename = os.path.join(output_dir, f"Page{i+1}_{image_file.name}")
                with open(output_filename, "wb") as fp:
                    fp.write(image_file.data)
                count += 1

        if count == 0:
            return {"message": "No images found in this PDF."}

        zip_path = os.path.join(temp_dir, "extracted_images_archive")
        shutil.make_archive(zip_path, 'zip', output_dir)
        return FileResponse(f"{zip_path}.zip", media_type="application/zip", filename=f"{base_name}_extracted_images.zip")
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    level: int = Form(...),
    strip_metadata: bool = Form(False),
    output_dir: str = Form(None),
):
    """10. Optimizes and compresses a PDF with Lossless (1) and Lossy (2) options."""
    temp_dir = tempfile.mkdtemp()
    file_path = save_upload_to_temp(file, temp_dir)
    output_path = os.path.join(temp_dir, "compressed_document.pdf")
    filename = "compressed_document.pdf"

    try:
        doc = fitz.open(file_path)

        if level == 1:
            doc.save(output_path, garbage=4, deflate=True, clean=True)
            doc.close()

            # Strip metadata via PdfWriter round-trip if requested
            if strip_metadata:
                stripped_path = os.path.join(temp_dir, "compressed_clean.pdf")
                reader = PdfReader(output_path)
                writer = PdfWriter()
                for page in reader.pages:
                    writer.add_page(page)
                strip_metadata_from_writer(writer)
                with open(stripped_path, "wb") as f:
                    writer.write(f)
                output_path = stripped_path

        elif level == 2:
            img_list = []
            for page in doc:
                pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                img_list.append(img)
            doc.close()

            img_list[0].save(
                output_path,
                "PDF",
                resolution=72.0,
                save_all=True,
                append_images=img_list[1:]
            )

            # Strip metadata via PdfWriter round-trip if requested
            if strip_metadata:
                stripped_path = os.path.join(temp_dir, "compressed_clean.pdf")
                reader = PdfReader(output_path)
                writer = PdfWriter()
                for page in reader.pages:
                    writer.add_page(page)
                strip_metadata_from_writer(writer)
                with open(stripped_path, "wb") as f:
                    writer.write(f)
                output_path = stripped_path
        else:
            return {"error": "Invalid compression level. Choose 1 or 2."}

        return finalize_response(output_path, "application/pdf", filename, output_dir)
    except Exception as e:
        return {"error": str(e)}


# Note: To run this server, use the command:
# uvicorn FastAPI_wrapper:app --reload