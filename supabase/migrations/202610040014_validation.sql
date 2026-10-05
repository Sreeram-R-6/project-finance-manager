alter table public.bill_items add constraint nonnegative_bill_item_amounts check(unit_price_minor>=0 and tax_minor>=0 and discount_minor>=0 and line_total_minor>=0);
alter table public.bills add constraint nonnegative_bill_components check(subtotal_minor>=0 and tax_minor>=0);
alter table public.purchase_request_items add constraint nonnegative_request_estimates check(estimated_unit_minor>=0 and estimated_total_minor>=0);
alter table public.purchase_items add constraint purchase_item_description check(length(trim(description))>0);
alter table public.bill_items add constraint bill_item_description check(length(trim(description))>0);
alter table public.purchase_request_items add constraint request_item_description check(length(trim(description))>0);
