"use client";
import type { UseFormRegister } from "react-hook-form";
import type { EntryInput } from "@/lib/entry-schema";
import { Plus, Trash2 } from "lucide-react";
export function ItemFields({
  register,
  fields,
  add,
  remove,
  assets = true,
}: {
  register: UseFormRegister<EntryInput>;
  fields: { id: string }[];
  add: () => void;
  remove: (index: number) => void;
  assets?: boolean;
}) {
  return (
    <>
      <div className="items">
        {fields.map((f, i) => (
          <div className="item-editor" key={f.id}>
            <div className="itemrow">
              <label>
                Item
                <input
                  {...register(`items.${i}.description`)}
                  placeholder="What was it for?"
                  required={assets}
                />
              </label>
              <label>
                Unit price
                <input {...register(`items.${i}.price`)} inputMode="decimal" />
              </label>
              <label>
                Quantity
                <input
                  {...register(`items.${i}.quantity`)}
                  inputMode="decimal"
                />
              </label>
            </div>
            <details className="item-extras">
              <summary>Tax, discount & asset tracking</summary>
              <div className="formgrid">
                <label>
                  Tax amount
                  <input {...register(`items.${i}.tax`)} inputMode="decimal" />
                </label>
                <label>
                  Discount
                  <input
                    {...register(`items.${i}.discount`)}
                    inputMode="decimal"
                  />
                </label>
              </div>
              {assets && (
                <label className="row" style={{ marginTop: 16 }}>
                  <input type="checkbox" {...register(`items.${i}.asset`)} />
                  Track this item as an asset
                </label>
              )}
            </details>
            {i > 0 && (
              <button type="button" onClick={() => remove(i)}>
                <Trash2 size={14} />
                Remove item
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} style={{ justifySelf: "start" }}>
        <Plus size={15} />
        Add another item
      </button>
    </>
  );
}
