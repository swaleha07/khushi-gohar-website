'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Boxes, Search, AlertTriangle, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/lib/utils';

export default function AdminInventoryPage() {
  const { products, updateVariantStock } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [savedAlert, setSavedAlert] = useState(false);

  const inventoryItems = products.flatMap((product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((variant) => ({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || '/images/products/extra_whitening_combo.jpg',
        variantId: variant.id,
        variantName: variant.name,
        sku: variant.sku,
        price: variant.discountPrice ?? variant.price,
        stock: variant.stock,
      }));
    }
    return [
      {
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || '/images/products/extra_whitening_combo.jpg',
        variantId: 'base',
        variantName: 'Standard',
        sku: product.sku,
        price: product.discountPrice ?? product.price,
        stock: product.baseStock,
      },
    ];
  });

  const filtered = inventoryItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockChange = (productId: string, variantId: string, value: number) => {
    updateVariantStock(productId, variantId, value);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F8D7E3]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
            Live Inventory Management
          </h1>
          <p className="text-xs text-[#6E6266] mt-0.5">
            Monitor real-time warehouse stock counts, adjust stock levels, and view low-stock warnings.
          </p>
        </div>

        {savedAlert && (
          <div className="p-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Stock levels updated!</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#F8D7E3] shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6266]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search variant name or SKU code..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFF4F7] rounded-xl border border-[#F8D7E3] text-xs text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
          />
        </div>

        <span className="text-xs text-[#6E6266]">
          Total Variant SKUs: <strong>{inventoryItems.length}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#F8D7E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FFF4F7]/60 border-b border-[#F8D7E3] text-[#6E6266] uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Item & Variant</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Available Stock</th>
                <th className="py-3.5 px-4 text-right">Quick Refill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8D7E3]/60">
              {filtered.map((item) => {
                const isLow = item.stock <= 10 && item.stock > 0;
                const isOut = item.stock === 0;

                return (
                  <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-[#FFF4F7]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#FFF4F7] border border-[#F8D7E3] shrink-0">
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[#3A3034] text-xs">{item.productName}</p>
                          <p className="text-[10px] text-[#D66B8B] font-semibold">{item.variantName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#6E6266]">
                      {item.sku}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#3A3034]">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isOut
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        min={0}
                        value={item.stock}
                        onChange={(e) =>
                          handleStockChange(item.productId, item.variantId, Number(e.target.value))
                        }
                        className="w-20 px-2.5 py-1 text-xs font-bold text-[#3A3034] bg-[#FFF4F7] border border-[#F8D7E3] rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleStockChange(item.productId, item.variantId, item.stock + 25)
                        }
                        className="px-2.5 py-1 bg-[#FFF4F7] hover:bg-[#F8D7E3] text-[#3A3034] border border-[#F8D7E3] rounded-lg text-[11px] font-bold transition-colors"
                      >
                        +25
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleStockChange(item.productId, item.variantId, item.stock + 100)
                        }
                        className="px-2.5 py-1 bg-[#FFF4F7] hover:bg-[#F8D7E3] text-[#3A3034] border border-[#F8D7E3] rounded-lg text-[11px] font-bold transition-colors"
                      >
                        +100
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
