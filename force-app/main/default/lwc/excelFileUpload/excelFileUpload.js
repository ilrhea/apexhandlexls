import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import XLSX_LIB from '@salesforce/resourceUrl/xlsx';

export default class ExcelFileUpload extends LightningElement {
    @track fileHeaders = [];
    @track fileData = [];
    xlsxLibLoaded = false;

    renderedCallback() {
        // Ensure the XLSX library is loaded only once
        if (this.xlsxLibLoaded) {
            return;
        }
        loadScript(this, XLSX_LIB)
            .then(() => {
                this.xlsxLibLoaded = true;
                console.log('XLSX library loaded successfully');
            })
            .catch(error => {
                console.error('Error loading XLSX library', error);
            });
    }

    handleFileChange(event) {
        if (!this.xlsxLibLoaded) {
            console.error('XLSX library is not loaded');
            return;
        }

        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binaryString = e.target.result;
                try {
                    // Use the XLSX library correctly after it is loaded
                    const workbook = window.XLSX.read(binaryString, { type: 'binary' });

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = window.XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1 });

                    // Set the file headers
                    this.fileHeaders = worksheet[0];

                    // Prepare the data with unique IDs for rows and cells
                    this.fileData = worksheet.slice(1).map((row, rowIndex) => {
                        return {
                            id: 'row-' + rowIndex, // Generate a unique id for each row
                            cells: row.map((cell, cellIndex) => {
                                return {
                                    id: 'cell-' + rowIndex + '-' + cellIndex, // Generate a unique id for each cell
                                    value: cell
                                };
                            })
                        };
                    });
                } catch (error) {
                    console.error('Error processing Excel file', error);
                }
            };
            reader.readAsBinaryString(file);
        }
    }
}
