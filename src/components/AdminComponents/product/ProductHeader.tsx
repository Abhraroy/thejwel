"use client";
import useAdminStore from "../../../zustandStore/AdminZustandStore";

export default function ProductHeader({isDarkTheme}: {isDarkTheme: boolean}) {
    const { showAddProduct, setShowAddProduct, selectedProduct, setSelectedProduct } = useAdminStore();

    const PlusIcon = ({ className = 'w-5 h-5' }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={className}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                    Products Management
                </h1>
                <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage your jewelry products, categories, and inventory
                </p>
            </div>
            <button
                onClick={() => {
                    if (showAddProduct) {
                        // Cancel add/edit
                        setShowAddProduct(false);
                        setSelectedProduct(null);
                    } else {
                        // Start "add product" mode (ensure not editing)
                        setSelectedProduct(null);
                        setShowAddProduct(true);
                    }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkTheme
                        ? 'bg-[#E94E8B] text-white hover:bg-[#d43d75]'
                        : 'bg-[#E94E8B] text-white hover:bg-[#d43d75]'
                }`}
            >
                {!showAddProduct ? <PlusIcon className="w-5 h-5" /> : ""}
                {showAddProduct ? (selectedProduct ? 'Cancel Edit' : 'Cancel') : 'Add Product'}
            </button>
        </div>
    );
}
