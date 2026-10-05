create function public.record_position(p_project uuid,p_table text,p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare gross bigint; refunded bigint; r jsonb; begin
if not private.member(p_project) then raise exception 'PERMISSION_DENIED'; end if; perform private.validate_entity(p_project,p_table,p_id);
case p_table
when 'purchases' then select total_minor into gross from public.purchases where id=p_id; select coalesce(sum(f.amount_minor),0) into refunded from public.refunds f join public.financial_events e on e.id=f.financial_event_id where f.purchase_id=p_id and e.status='POSTED'; return jsonb_build_object('gross_minor',gross::text,'refunds_minor',refunded::text,'net_minor',(gross-refunded)::text,'allocations',coalesce((select jsonb_agg(private.safe_json(to_jsonb(f))||jsonb_build_object('outstanding_minor',case when f.source_type='MEMBER' then private.source_outstanding(f.id)::text else null end)) from public.purchase_funding_allocations f where f.purchase_id=p_id),'[]'));
when 'bills' then select total_minor into gross from public.bills where id=p_id; select coalesce(sum(f.amount_minor),0) into refunded from public.refunds f join public.financial_events e on e.id=f.financial_event_id where f.bill_id=p_id and e.status='POSTED'; return jsonb_build_object('gross_minor',gross::text,'credits_minor',refunded::text,'outstanding_minor',private.bill_balance(p_id)::text);
when 'reimbursement_claims' then return jsonb_build_object('remaining_minor',private.claim_balance(p_id)::text);
when 'advances' then return jsonb_build_object('outstanding_minor',private.advance_balance(p_id)::text);
else return '{}'; end case; end $$;
revoke all on function public.record_position(uuid,text,uuid) from public;
grant execute on function public.record_position(uuid,text,uuid) to authenticated;
