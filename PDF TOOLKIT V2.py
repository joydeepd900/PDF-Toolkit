import os  # Used for navigating the operating system (finding files, paths)
from pypdf import PdfWriter, PdfReader  # The core library for reading and writing PDF files
import tkinter as tk  # Standard GUI library for creating pop-up windows
from tkinter import filedialog  # Sub-module specifically for opening "Select File" dialogs
from PIL import Image  # Pillow library used for image processing (JPG/PNG to PDF)

# --- HELPER FUNCTIONS ---
# These functions handle the graphical file/folder selection windows.

def get_folder_path():
    """Opens a dialog box for the user to select a folder."""
    print("Head to folder selection window")
    root = tk.Tk()      # Create a hidden Tkinter root window
    root.withdraw()     # Hide the main window so only the dialog appears
    # Open the Windows Explorer dialog to pick a directory
    folder_selected = filedialog.askdirectory(title="Select the Folder Containing PDFs")
    root.destroy()      # destroy the hidden window to free up memory
    return folder_selected

def get_file_path():
    """Opens a dialog box to select a single PDF file."""
    print("Head to file selection window")
    root = tk.Tk()
    root.withdraw()
    # Filter ensures only .pdf files are visible to the user
    file_selected = filedialog.askopenfilename(title="Select PDF", filetypes=[("PDF Files", "*.pdf")])
    root.destroy()
    return file_selected

def get_images():
    """Opens a dialog box to select multiple images at once."""
    print("Head to image selection window")
    root = tk.Tk()
    root.withdraw()
    # 'askopenfilenames' (plural) returns a tuple of all selected file paths
    files = filedialog.askopenfilenames(
        title="Select Images to Convert",
        filetypes=[("Images", "*.jpg *.jpeg *.png")]
    )
    root.destroy()
    # Ensure the returned data is formatted as a Python list
    return root.tk.splitlist(files)

# --- FEATURE FUNCTIONS ---

def mergepdfs():
    """Combines all PDFs in a selected folder into one file."""
    folder = get_folder_path()
    if not folder: 
        print("Nothing selected")
        return
    
    merger = PdfWriter() # Create the object that will hold the merged pages
    
    # List all files in the directory that end with .pdf
    files = [f for f in os.listdir(folder) if f.endswith('.pdf')]
    files.sort() # Sort alphabetically to ensure pages are merged in the correct order
    
    if not files:
        print("No PDF files found")
        return
    print("Merging")
    
    # Loop through every PDF found in the folder
    for filename in files:
        # Create the full system path (e.g., C:/Users/Docs/file.pdf)
        full_path = os.path.join(folder, filename)
        merger.append(full_path) # Add the file to the merger object
        print(filename, " added")

    # Safety Loop: Checks if the filename already exists to prevent overwriting
    while True:
        new_pdf_name = input("Enter name for the new PDF: ")
        output_path = os.path.join(folder, f"{new_pdf_name}.pdf")
        
        if os.path.exists(output_path):
            print(f"Error!!! A file named '{new_pdf_name}.pdf' already exists.\n")
        else:
            break # Break the loop only if the filename is unique

    merger.write(output_path) # Save the final merged file
    merger.close() # Close the stream to free resources
    print("File saved as ", output_path)


def extractpages():
    """Extracts a specific range of pages (e.g., 3-5) into a new file."""
    file_path = get_file_path()
    if not file_path:
        print("No file selected.")
        return

    try:
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)
        print("Total pages in document", total_pages)
        
        # Get user input for range
        stpg = int(input("Enter start page "))
        epg = int(input("Enter end page "))
        
        # Validation: Check if numbers make sense (not negative, not out of bounds)
        if stpg < 1 or epg > total_pages or stpg > epg:
            print("Invalid range! Please check page numbers.")
            return

        writer = PdfWriter()
        
        # Loop through the requested range
        # Note: Python is 0-indexed, so we subtract 1 from the start page
        for i in range(stpg - 1, epg):
            writer.add_page(reader.pages[i])
            
        parent_folder = os.path.dirname(file_path)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_filename = f"{base_name}_pages_{stpg}-{epg}.pdf"
        output_path = os.path.join(parent_folder, output_filename)
        
        with open(output_path, "wb") as out_file:
            writer.write(out_file)
            
        print(f"Extracted pages {stpg} to {epg} into: {output_filename}")
    except Exception as e:
        print("An error occurred ", e)


def splitpdf():
    """Separates a single PDF into individual files for each page."""
    file_path = get_file_path()
    if not file_path:
        print("No file selected.")
        return
    
    try:
        reader = PdfReader(file_path)
        # Determine where the original file is, to save new pages in the same spot
        parent_folder = os.path.dirname(file_path) 
        # Get the filename without the .pdf extension (e.g., 'document')
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        
        # Loop through every page in the source PDF
        for i, page in enumerate(reader.pages):
            writer = PdfWriter()  # Create a fresh PDF object for this single page
            writer.add_page(page) # Add the current page to it
            
            # Name format: document_page_1.pdf, document_page_2.pdf, etc.
            output_filename = f"{base_name}_page_{i+1}.pdf"
            output_path = os.path.join(parent_folder, output_filename)
            
            with open(output_path, "wb") as out_file: # 'wb' = Write Binary mode
                writer.write(out_file)
            print("Created ", output_filename)
            
    except Exception as e:
        print("An error occurred:", e)


def imgpdf():
    """Converts a selection of images (JPG/PNG) into a single PDF."""
    img_files = get_images()
    if not img_files:
        print("No images selected.")
        return

    try:
        # Open the first image and convert to RGB (Handles PNG transparency issues)
        image_1 = Image.open(img_files[0])
        im_1 = image_1.convert('RGB')
        
        # Process the remaining images in the list
        img_list = []
        for f in img_files[1:]:
            img = Image.open(f)
            img_list.append(img.convert('RGB'))
            
        parent_folder = os.path.dirname(img_files[0])
        name = input("Enter name for the PDF: ")
        output_path = os.path.join(parent_folder, f"{name}.pdf")
        
        # Save the first image as PDF and append the rest of the list
        im_1.save(output_path, save_all=True, append_images=img_list)
        print(f"Success! Images converted to {output_path}")
        
    except Exception as e:
        print(f"Error converting images: {e}")
        
def lockpdf():
    """Encrypts a PDF file with a user-provided password."""
    file_path = get_file_path()
    if not file_path:
        print("No file selected.")
        return

    # Loop to ensure the user does not leave the password blank
    while True:
        password = input("Enter a strong password: ")
        if not password:
            print("Password cannot be empty!")
        else:
            break

    try:
        reader = PdfReader(file_path)
        writer = PdfWriter()
        
        # Copy all pages from the original reader to the new writer
        for page in reader.pages:
            writer.add_page(page)
            
        # Apply AES-128 encryption to the writer object
        writer.encrypt(password)

        parent_folder = os.path.dirname(file_path)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_filename = f"{base_name}-encrypted.pdf"
        output_path = os.path.join(parent_folder, output_filename)
        
        with open(output_path, "wb") as out_file:
            writer.write(out_file)
        print("New pass-protected copy saved at: ", output_path ,"\n")
    except Exception as e:
        print("An error occurred: ", e)

def strip_metadata():
    """Removes hidden data (Author, Creator, Date) from the PDF."""
    file_path = get_file_path()
    if not file_path:
        print("No file selected.")
        return

    try:
        reader = PdfReader(file_path)
        writer = PdfWriter()

        # Copying all pages to the new writer (but we DO NOT copy the old metadata object)
        for page in reader.pages:
            writer.add_page(page)

        # Explicitly setting metadata to an empty dictionary to wipe it clean
        writer.add_metadata({})

        # Save the file
        parent_folder = os.path.dirname(file_path)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_filename = f"{base_name}_clean.pdf"
        output_path = os.path.join(parent_folder, output_filename)
        
        with open(output_path, "wb") as out_file:
            writer.write(out_file)
            
        print(f"Success! Metadata stripped. Saved at: {output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")
        
def pdf_to_text():
    """Extracts all text from a PDF and saves it as a .txt file."""
    file_path = get_file_path()
    if not file_path:
        print("No file selected.")
        return

    try:
        reader = PdfReader(file_path)
        
        # Prepare the output filename (same name, but .txt)
        parent_folder = os.path.dirname(file_path)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_filename = f"{base_name}_extracted.txt"
        output_path = os.path.join(parent_folder, output_filename)
        
        print(f"Extracting text from {len(reader.pages)} pages...")
        
        with open(output_path, "w", encoding="utf-8") as text_file:
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    text_file.write(f"--- Page {i+1} ---\n")
                    text_file.write(text)
                    text_file.write("\n\n")
        
        print(f"Success! Text saved to: {output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

# --- MAIN MENU ---
# Displays options and routes the user to the correct function

while True:
    print("--- PDF TOOLKIT V2 ---")
    print("1. Merge PDFs")
    print("2. Extract a specific Range of Pages to a Single PDF")
    print("3. Split PDF (Extract Individual Pages into  PDFs)")
    print("4. Convert Images to PDF")         
    print("5. Lock PDF (Security)")
    print("6. Strip Metadata (Privacy)")
    print("7. PDF to Text Extraction")
    print("0. To Exit")

    ch = input("\n Choose an option (0-7): ")
    if ch == '0': break
    elif ch == '1': mergepdfs()
    elif ch == '2': extractpages()
    elif ch == '3': splitpdf()
    elif ch == '4': imgpdf()
    elif ch == '5': lockpdf()
    elif ch == '6': strip_metadata()
    elif ch == '7': pdf_to_text()
    else: print("Invalid choice! Please try again...")
