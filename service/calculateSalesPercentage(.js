// Function to calculate sales percentage
function calculateSalesPercentage(onHandQuantity, inStockQuantity) {
    if (onHandQuantity === 0) {
        return 'N/A';
    }

    const salesPercentage = ((inStockQuantity / onHandQuantity) * 100).toFixed(2) + '%';
    return salesPercentage;
}

module.exports = { calculateSalesPercentage };