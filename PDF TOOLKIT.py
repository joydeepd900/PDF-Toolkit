import os
from pypdf import PdfWriter, PdfReader
import tkinter as tk
from tkinter import filedialog

def get_folder_path():
    print("Head to folder selection window")
    root=tk.Tk()
    root.withdraw()
    folder_selected = filedialog.askdirectory(title="Select the Folder Containing PDFs")
    root.destroy()
    return folder_selected

def get_file_path():
    print("Head to file selection window")
    root=tk.Tk()
    root.withdraw()
    file_selected = filedialog.askopenfilename(title="Select PDF to Split",filetypes=[("PDF Files", "*.pdf")])
    return file_selected

def mergepdfs():
    folder=get_folder_path()
    if not folder: 
        print("Nothing selected")
        return
    
    merger=PdfWriter()
    files=[f for f in os.listdir(folder) if f.endswith('.pdf')]
    files.sort()
    if not files:
        print("No PDF files found")
        return
    print("Merging")
    
    for filename in files: #joining path with file name
        full_path = os.path.join(folder, filename)
        merger.append(full_path)
        print(filename," added")
    while True:
        new_pdf_name=input("Enter name for the new PDF: ")
        output_path = os.path.join(folder, f"{new_pdf_name}.pdf")
        if os.path.exists(output_path):
            print(f"Error!!! A file named '{new_pdf_name}.pdf' already exists.\n")
        else:
            break
    merger.write(output_path)
    merger.close()
    print("File saved as ",output_path)

def splitpdf():
    file_path=get_file_path()
    if not file_path:
        print("No file selected.")
        return
    
    try:
        reader=PdfReader(file_path)
        parent_folder = os.path.dirname(file_path) #getting the original file's folder, so we can save pages there
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        for i, page in enumerate(reader.pages):
            writer=PdfWriter()
            writer.add_page(page)
            output_filename=f"{base_name}_page_{i+1}.pdf"
            output_path = os.path.join(parent_folder, output_filename)
            
            with open(output_path, "wb") as out_file:
                writer.write(out_file)
            print("Created ",output_filename)
    except Exception as e:
        print("An error occurred:", e)

def extractpages():
    file_path=get_file_path()
    if not file_path:
        print("No file selected.")
        return

    try:
        reader=PdfReader(file_path)
        total_pages=len(reader.pages)
        print("Total pages in document", total_pages)
        stpg=int(input("Enter start page "))
        epg=int(input("Enter end page "))
        if stpg < 1 or epg > total_pages or stpg > epg:
            print("Invalid range! Please check page numbers.")
            return

        writer=PdfWriter()
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

def lockpdf():
    file_path=get_file_path()
    if not file_path:
        print("No file selected.")
        return

    while True:
        password=input("Enter a strong password: ")
        if not password:
            print("Password cannot be empty!")
        else:
            break

    try:
        reader=PdfReader(file_path)
        writer=PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        writer.encrypt(password)

        parent_folder=os.path.dirname(file_path)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_filename=f"{base_name}-encrypted.pdf"
        output_path = os.path.join(parent_folder, output_filename)
        
        with open(output_path, "wb") as out_file:
            writer.write(out_file)
        print("New pass-protected copy saved at: ", output_path ,"\n")
    except Exception as e:
        print("An error occurred: ", e)

print("PDF TOOLKIT")
print("1. Merge PDFs")
print("2. Split a PDF")
print("3. Extract pages from PDF")
print("4. Password Protect a PDF")
ch = input("Choose an option (1-4): ")
if ch=='1':
    mergepdfs()
elif ch=='2':
    splitpdf()
elif ch=='3':
    extractpages()
elif ch=='4':
    lockpdf()
else:
    print("Invalid choice!")
