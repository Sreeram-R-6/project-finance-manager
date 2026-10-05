export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      activity_events: {
        Row: {
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
          project_id: string;
          summary: string;
          type: string;
        };
        Insert: {
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
          project_id: string;
          summary: string;
          type: string;
        };
        Update: {
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          project_id?: string;
          summary?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      advance_expense_links: {
        Row: {
          advance_id: string;
          amount_minor: number;
          id: string;
          project_id: string;
          purchase_funding_allocation_id: string;
        };
        Insert: {
          advance_id: string;
          amount_minor: number;
          id?: string;
          project_id: string;
          purchase_funding_allocation_id: string;
        };
        Update: {
          advance_id?: string;
          amount_minor?: number;
          id?: string;
          project_id?: string;
          purchase_funding_allocation_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "advance_expense_links_advance_id_project_id_fkey";
            columns: ["advance_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "advances";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "advance_expense_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "advance_expense_links_purchase_funding_allocation_id_proje_fkey";
            columns: ["purchase_funding_allocation_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchase_funding_allocations";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      advance_returns: {
        Row: {
          advance_id: string;
          amount_minor: number;
          financial_event_id: string;
          id: string;
          project_id: string;
          reference: string | null;
          returned_at: string;
        };
        Insert: {
          advance_id: string;
          amount_minor: number;
          financial_event_id: string;
          id?: string;
          project_id: string;
          reference?: string | null;
          returned_at?: string;
        };
        Update: {
          advance_id?: string;
          amount_minor?: number;
          financial_event_id?: string;
          id?: string;
          project_id?: string;
          reference?: string | null;
          returned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "advance_returns_advance_id_project_id_fkey";
            columns: ["advance_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "advances";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "advance_returns_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "advance_returns_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      advances: {
        Row: {
          created_at: string;
          created_by: string;
          currency: string;
          financial_event_id: string | null;
          id: string;
          issued_at: string | null;
          issued_minor: number;
          member_user_id: string;
          project_account_id: string | null;
          project_id: string;
          purpose: string;
          requested_minor: number;
          status: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          currency: string;
          financial_event_id?: string | null;
          id?: string;
          issued_at?: string | null;
          issued_minor?: number;
          member_user_id: string;
          project_account_id?: string | null;
          project_id: string;
          purpose: string;
          requested_minor?: number;
          status?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          currency?: string;
          financial_event_id?: string | null;
          id?: string;
          issued_at?: string | null;
          issued_minor?: number;
          member_user_id?: string;
          project_account_id?: string | null;
          project_id?: string;
          purpose?: string;
          requested_minor?: number;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "advances_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "advances_project_account_id_project_id_fkey";
            columns: ["project_account_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_accounts";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "advances_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      approval_instances: {
        Row: {
          approved_amount_minor: number;
          completed_at: string | null;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          policy_id: string | null;
          posted_event_id: string | null;
          project_id: string;
          status: string;
        };
        Insert: {
          approved_amount_minor?: number;
          completed_at?: string | null;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          policy_id?: string | null;
          posted_event_id?: string | null;
          project_id: string;
          status?: string;
        };
        Update: {
          approved_amount_minor?: number;
          completed_at?: string | null;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          policy_id?: string | null;
          posted_event_id?: string | null;
          project_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "approval_instances_policy_id_fkey";
            columns: ["policy_id"];
            isOneToOne: false;
            referencedRelation: "approval_policies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "approval_instances_posted_event_id_project_id_fkey";
            columns: ["posted_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "approval_instances_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      approval_policies: {
        Row: {
          entity_type: string;
          id: string;
          is_active: boolean;
          name: string;
          priority: number;
          project_id: string;
          rule_json: Json;
        };
        Insert: {
          entity_type: string;
          id?: string;
          is_active?: boolean;
          name: string;
          priority?: number;
          project_id: string;
          rule_json: Json;
        };
        Update: {
          entity_type?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          priority?: number;
          project_id?: string;
          rule_json?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "approval_policies_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      approval_steps: {
        Row: {
          approval_instance_id: string;
          approver_role: Database["public"]["Enums"]["project_role"] | null;
          approver_user_id: string | null;
          comment: string | null;
          decided_at: string | null;
          decided_by: string | null;
          id: string;
          project_id: string;
          status: string;
          step_order: number;
        };
        Insert: {
          approval_instance_id: string;
          approver_role?: Database["public"]["Enums"]["project_role"] | null;
          approver_user_id?: string | null;
          comment?: string | null;
          decided_at?: string | null;
          decided_by?: string | null;
          id?: string;
          project_id: string;
          status?: string;
          step_order: number;
        };
        Update: {
          approval_instance_id?: string;
          approver_role?: Database["public"]["Enums"]["project_role"] | null;
          approver_user_id?: string | null;
          comment?: string | null;
          decided_at?: string | null;
          decided_by?: string | null;
          id?: string;
          project_id?: string;
          status?: string;
          step_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "approval_steps_approval_instance_id_project_id_fkey";
            columns: ["approval_instance_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "approval_instances";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "approval_steps_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          asset_tag: string | null;
          assigned_user_id: string | null;
          currency: string;
          id: string;
          location: string | null;
          name: string;
          notes: string | null;
          project_id: string;
          purchase_date: string | null;
          purchase_item_id: string | null;
          purchase_value_minor: number;
          serial_number: string | null;
          status: string;
          warranty_expires_at: string | null;
        };
        Insert: {
          asset_tag?: string | null;
          assigned_user_id?: string | null;
          currency: string;
          id?: string;
          location?: string | null;
          name: string;
          notes?: string | null;
          project_id: string;
          purchase_date?: string | null;
          purchase_item_id?: string | null;
          purchase_value_minor?: number;
          serial_number?: string | null;
          status?: string;
          warranty_expires_at?: string | null;
        };
        Update: {
          asset_tag?: string | null;
          assigned_user_id?: string | null;
          currency?: string;
          id?: string;
          location?: string | null;
          name?: string;
          notes?: string | null;
          project_id?: string;
          purchase_date?: string | null;
          purchase_item_id?: string | null;
          purchase_value_minor?: number;
          serial_number?: string | null;
          status?: string;
          warranty_expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_purchase_item_id_project_id_fkey";
            columns: ["purchase_item_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchase_items";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_user_id: string | null;
          after_data: Json | null;
          before_data: Json | null;
          correlation_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          project_id: string | null;
          reason: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          correlation_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          project_id?: string | null;
          reason?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          correlation_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          project_id?: string | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      bill_items: {
        Row: {
          bill_id: string;
          description: string;
          discount_minor: number;
          id: string;
          line_total_minor: number;
          project_id: string;
          quantity: number;
          tax_minor: number;
          unit_price_minor: number;
        };
        Insert: {
          bill_id: string;
          description: string;
          discount_minor?: number;
          id?: string;
          line_total_minor: number;
          project_id: string;
          quantity: number;
          tax_minor?: number;
          unit_price_minor: number;
        };
        Update: {
          bill_id?: string;
          description?: string;
          discount_minor?: number;
          id?: string;
          line_total_minor?: number;
          project_id?: string;
          quantity?: number;
          tax_minor?: number;
          unit_price_minor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_project_id_fkey";
            columns: ["bill_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "bills";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "bill_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      bill_payments: {
        Row: {
          amount_minor: number;
          bill_id: string;
          financial_event_id: string;
          id: string;
          method: string | null;
          paid_at: string;
          project_account_id: string;
          project_id: string;
          reference: string | null;
        };
        Insert: {
          amount_minor: number;
          bill_id: string;
          financial_event_id: string;
          id?: string;
          method?: string | null;
          paid_at?: string;
          project_account_id: string;
          project_id: string;
          reference?: string | null;
        };
        Update: {
          amount_minor?: number;
          bill_id?: string;
          financial_event_id?: string;
          id?: string;
          method?: string | null;
          paid_at?: string;
          project_account_id?: string;
          project_id?: string;
          reference?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bill_payments_bill_id_project_id_fkey";
            columns: ["bill_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "bills";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "bill_payments_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "bill_payments_project_account_id_project_id_fkey";
            columns: ["project_account_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_accounts";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "bill_payments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      bills: {
        Row: {
          category_id: string | null;
          corrects_event_id: string | null;
          created_at: string;
          created_by: string;
          currency: string;
          due_date: string;
          financial_event_id: string | null;
          id: string;
          invoice_number: string | null;
          issue_date: string;
          linked_request_id: string | null;
          notes: string | null;
          project_id: string;
          status: string;
          subtotal_minor: number;
          tax_minor: number;
          total_minor: number;
          vendor_id: string | null;
        };
        Insert: {
          category_id?: string | null;
          corrects_event_id?: string | null;
          created_at?: string;
          created_by: string;
          currency: string;
          due_date: string;
          financial_event_id?: string | null;
          id?: string;
          invoice_number?: string | null;
          issue_date?: string;
          linked_request_id?: string | null;
          notes?: string | null;
          project_id: string;
          status?: string;
          subtotal_minor: number;
          tax_minor?: number;
          total_minor: number;
          vendor_id?: string | null;
        };
        Update: {
          category_id?: string | null;
          corrects_event_id?: string | null;
          created_at?: string;
          created_by?: string;
          currency?: string;
          due_date?: string;
          financial_event_id?: string | null;
          id?: string;
          invoice_number?: string | null;
          issue_date?: string;
          linked_request_id?: string | null;
          notes?: string | null;
          project_id?: string;
          status?: string;
          subtotal_minor?: number;
          tax_minor?: number;
          total_minor?: number;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bills_category_id_project_id_fkey";
            columns: ["category_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "bills_corrects_event_id_project_id_fkey";
            columns: ["corrects_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "bills_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "bills_linked_request_id_project_id_fkey";
            columns: ["linked_request_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchase_requests";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "bills_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bills_vendor_id_project_id_fkey";
            columns: ["vendor_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      budget_lines: {
        Row: {
          budget_id: string;
          category_id: string;
          hard_stop: boolean;
          id: string;
          planned_minor: number;
          project_id: string;
          warning_percent: number;
        };
        Insert: {
          budget_id: string;
          category_id: string;
          hard_stop?: boolean;
          id?: string;
          planned_minor: number;
          project_id: string;
          warning_percent?: number;
        };
        Update: {
          budget_id?: string;
          category_id?: string;
          hard_stop?: boolean;
          id?: string;
          planned_minor?: number;
          project_id?: string;
          warning_percent?: number;
        };
        Relationships: [
          {
            foreignKeyName: "budget_lines_budget_id_project_id_fkey";
            columns: ["budget_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "budgets";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "budget_lines_category_id_project_id_fkey";
            columns: ["category_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "budget_lines_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: {
          end_date: string;
          id: string;
          name: string;
          project_id: string;
          start_date: string;
          status: string;
        };
        Insert: {
          end_date: string;
          id?: string;
          name: string;
          project_id: string;
          start_date: string;
          status?: string;
        };
        Update: {
          end_date?: string;
          id?: string;
          name?: string;
          project_id?: string;
          start_date?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          is_active: boolean;
          kind: string;
          name: string;
          project_id: string;
        };
        Insert: {
          id?: string;
          is_active?: boolean;
          kind?: string;
          name: string;
          project_id: string;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          kind?: string;
          name?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          author_user_id: string;
          body: string;
          created_at: string;
          deleted_at: string | null;
          edited_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          project_id: string;
        };
        Insert: {
          author_user_id: string;
          body: string;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          project_id: string;
        };
        Update: {
          author_user_id?: string;
          body?: string;
          created_at?: string;
          deleted_at?: string | null;
          edited_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      document_templates: {
        Row: {
          body_template: string;
          created_by: string | null;
          id: string;
          is_system_template: boolean;
          name: string;
          project_id: string | null;
          subject_template: string | null;
          template_type: string;
          updated_at: string;
        };
        Insert: {
          body_template: string;
          created_by?: string | null;
          id?: string;
          is_system_template?: boolean;
          name: string;
          project_id?: string | null;
          subject_template?: string | null;
          template_type: string;
          updated_at?: string;
        };
        Update: {
          body_template?: string;
          created_by?: string | null;
          id?: string;
          is_system_template?: boolean;
          name?: string;
          project_id?: string | null;
          subject_template?: string | null;
          template_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_templates_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          checksum: string | null;
          created_at: string;
          document_type: string;
          entity_id: string;
          entity_type: string;
          id: string;
          mime_type: string;
          original_filename: string;
          project_id: string;
          size_bytes: number;
          status: string;
          storage_bucket: string;
          storage_path: string;
          uploaded_by: string;
        };
        Insert: {
          checksum?: string | null;
          created_at?: string;
          document_type: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          mime_type: string;
          original_filename: string;
          project_id: string;
          size_bytes: number;
          status?: string;
          storage_bucket?: string;
          storage_path: string;
          uploaded_by: string;
        };
        Update: {
          checksum?: string | null;
          created_at?: string;
          document_type?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          mime_type?: string;
          original_filename?: string;
          project_id?: string;
          size_bytes?: number;
          status?: string;
          storage_bucket?: string;
          storage_path?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      financial_accounts: {
        Row: {
          account_type: string;
          currency: string;
          id: string;
          is_active: boolean;
          name: string;
          owner_user_id: string | null;
          project_id: string;
        };
        Insert: {
          account_type: string;
          currency: string;
          id?: string;
          is_active?: boolean;
          name: string;
          owner_user_id?: string | null;
          project_id: string;
        };
        Update: {
          account_type?: string;
          currency?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          owner_user_id?: string | null;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_accounts_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      financial_events: {
        Row: {
          command_hash: string;
          corrects_event_id: string | null;
          created_by: string;
          description: string;
          event_date: string;
          event_type: string;
          id: string;
          idempotency_key: string;
          metadata: Json;
          posted_at: string;
          posted_by: string;
          project_id: string;
          reference_number: string | null;
          reverses_event_id: string | null;
          source_id: string | null;
          status: string;
        };
        Insert: {
          command_hash: string;
          corrects_event_id?: string | null;
          created_by: string;
          description: string;
          event_date?: string;
          event_type: string;
          id?: string;
          idempotency_key: string;
          metadata?: Json;
          posted_at?: string;
          posted_by: string;
          project_id: string;
          reference_number?: string | null;
          reverses_event_id?: string | null;
          source_id?: string | null;
          status?: string;
        };
        Update: {
          command_hash?: string;
          corrects_event_id?: string | null;
          created_by?: string;
          description?: string;
          event_date?: string;
          event_type?: string;
          id?: string;
          idempotency_key?: string;
          metadata?: Json;
          posted_at?: string;
          posted_by?: string;
          project_id?: string;
          reference_number?: string | null;
          reverses_event_id?: string | null;
          source_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_events_corrects_event_id_project_id_fkey";
            columns: ["corrects_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "financial_events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financial_events_reverses_event_id_project_id_fkey";
            columns: ["reverses_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      funding_sources: {
        Row: {
          currency: string;
          id: string;
          name: string;
          notes: string | null;
          project_id: string;
          sanctioned_amount_minor: number | null;
          type: string;
        };
        Insert: {
          currency: string;
          id?: string;
          name: string;
          notes?: string | null;
          project_id: string;
          sanctioned_amount_minor?: number | null;
          type?: string;
        };
        Update: {
          currency?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          project_id?: string;
          sanctioned_amount_minor?: number | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "funding_sources_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      funding_tranches: {
        Row: {
          amount_minor: number;
          financial_event_id: string;
          funding_source_id: string;
          id: string;
          project_id: string;
          received_at: string;
        };
        Insert: {
          amount_minor: number;
          financial_event_id: string;
          funding_source_id: string;
          id?: string;
          project_id: string;
          received_at: string;
        };
        Update: {
          amount_minor?: number;
          financial_event_id?: string;
          funding_source_id?: string;
          id?: string;
          project_id?: string;
          received_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "funding_tranches_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "funding_tranches_funding_source_id_project_id_fkey";
            columns: ["funding_source_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "funding_sources";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "funding_tranches_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      generated_documents: {
        Row: {
          entity_id: string;
          entity_type: string;
          generated_at: string;
          generated_by: string;
          id: string;
          project_id: string;
          reference_number: string;
          rendered_html: string;
          snapshot: Json;
          storage_document_id: string | null;
          template_id: string;
        };
        Insert: {
          entity_id: string;
          entity_type: string;
          generated_at?: string;
          generated_by: string;
          id?: string;
          project_id: string;
          reference_number: string;
          rendered_html: string;
          snapshot: Json;
          storage_document_id?: string | null;
          template_id: string;
        };
        Update: {
          entity_id?: string;
          entity_type?: string;
          generated_at?: string;
          generated_by?: string;
          id?: string;
          project_id?: string;
          reference_number?: string;
          rendered_html?: string;
          snapshot?: Json;
          storage_document_id?: string | null;
          template_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "generated_documents_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_documents_storage_document_id_fkey";
            columns: ["storage_document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "document_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      ledger_entries: {
        Row: {
          account_id: string;
          amount_minor: number;
          category_id: string | null;
          created_at: string;
          currency: string;
          direction: string;
          financial_event_id: string;
          id: string;
          memo: string | null;
          project_id: string;
        };
        Insert: {
          account_id: string;
          amount_minor: number;
          category_id?: string | null;
          created_at?: string;
          currency: string;
          direction: string;
          financial_event_id: string;
          id?: string;
          memo?: string | null;
          project_id: string;
        };
        Update: {
          account_id?: string;
          amount_minor?: number;
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          direction?: string;
          financial_event_id?: string;
          id?: string;
          memo?: string | null;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_entries_account_id_project_id_fkey";
            columns: ["account_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_accounts";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "ledger_entries_category_id_project_id_fkey";
            columns: ["category_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "ledger_entries_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "ledger_entries_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          dedupe_key: string | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          project_id: string | null;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          dedupe_key?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          project_id?: string | null;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          dedupe_key?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          project_id?: string | null;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          locale: string;
          timezone: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id: string;
          locale?: string;
          timezone?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          locale?: string;
          timezone?: string;
        };
        Relationships: [];
      };
      project_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          project_id: string;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["project_role"];
          token_hash: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          invited_by: string;
          project_id: string;
          revoked_at?: string | null;
          role: Database["public"]["Enums"]["project_role"];
          token_hash: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          project_id?: string;
          revoked_at?: string | null;
          role?: Database["public"]["Enums"]["project_role"];
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_invites_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_members: {
        Row: {
          id: string;
          is_active: boolean;
          joined_at: string;
          project_id: string;
          role: Database["public"]["Enums"]["project_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          is_active?: boolean;
          joined_at?: string;
          project_id: string;
          role?: Database["public"]["Enums"]["project_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          joined_at?: string;
          project_id?: string;
          role?: Database["public"]["Enums"]["project_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          closed_at: string | null;
          code: string;
          created_at: string;
          created_by: string;
          currency: string;
          description: string;
          expected_end_date: string | null;
          id: string;
          name: string;
          settings: Json;
          start_date: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          closed_at?: string | null;
          code: string;
          created_at?: string;
          created_by: string;
          currency?: string;
          description?: string;
          expected_end_date?: string | null;
          id?: string;
          name: string;
          settings?: Json;
          start_date?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          closed_at?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string;
          currency?: string;
          description?: string;
          expected_end_date?: string | null;
          id?: string;
          name?: string;
          settings?: Json;
          start_date?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_funding_allocations: {
        Row: {
          advance_id: string | null;
          amount_minor: number;
          currency: string;
          funding_source_id: string | null;
          id: string;
          member_user_id: string | null;
          project_account_id: string | null;
          project_id: string;
          purchase_id: string;
          source_type: string;
        };
        Insert: {
          advance_id?: string | null;
          amount_minor: number;
          currency: string;
          funding_source_id?: string | null;
          id?: string;
          member_user_id?: string | null;
          project_account_id?: string | null;
          project_id: string;
          purchase_id: string;
          source_type: string;
        };
        Update: {
          advance_id?: string | null;
          amount_minor?: number;
          currency?: string;
          funding_source_id?: string | null;
          id?: string;
          member_user_id?: string | null;
          project_account_id?: string | null;
          project_id?: string;
          purchase_id?: string;
          source_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_funding_allocations_advance_id_project_id_fkey";
            columns: ["advance_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "advances";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchase_funding_allocations_funding_source_id_project_id_fkey";
            columns: ["funding_source_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "funding_sources";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchase_funding_allocations_project_account_id_project_id_fkey";
            columns: ["project_account_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_accounts";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchase_funding_allocations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_funding_allocations_purchase_id_project_id_fkey";
            columns: ["purchase_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      purchase_items: {
        Row: {
          category_id: string | null;
          description: string;
          discount_minor: number;
          id: string;
          line_total_minor: number;
          mark_as_asset: boolean;
          project_id: string;
          purchase_id: string;
          quantity: number;
          sku: string | null;
          tax_minor: number;
          unit: string;
          unit_price_minor: number;
        };
        Insert: {
          category_id?: string | null;
          description: string;
          discount_minor?: number;
          id?: string;
          line_total_minor: number;
          mark_as_asset?: boolean;
          project_id: string;
          purchase_id: string;
          quantity: number;
          sku?: string | null;
          tax_minor?: number;
          unit?: string;
          unit_price_minor: number;
        };
        Update: {
          category_id?: string | null;
          description?: string;
          discount_minor?: number;
          id?: string;
          line_total_minor?: number;
          mark_as_asset?: boolean;
          project_id?: string;
          purchase_id?: string;
          quantity?: number;
          sku?: string | null;
          tax_minor?: number;
          unit?: string;
          unit_price_minor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_items_category_id_project_id_fkey";
            columns: ["category_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchase_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_items_purchase_id_project_id_fkey";
            columns: ["purchase_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      purchase_request_items: {
        Row: {
          description: string;
          estimated_total_minor: number;
          estimated_unit_minor: number;
          id: string;
          project_id: string;
          quantity: number;
          request_id: string;
        };
        Insert: {
          description: string;
          estimated_total_minor: number;
          estimated_unit_minor: number;
          id?: string;
          project_id: string;
          quantity: number;
          request_id: string;
        };
        Update: {
          description?: string;
          estimated_total_minor?: number;
          estimated_unit_minor?: number;
          id?: string;
          project_id?: string;
          quantity?: number;
          request_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_request_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_request_items_request_id_project_id_fkey";
            columns: ["request_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchase_requests";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      purchase_requests: {
        Row: {
          approved_at: string | null;
          category_id: string | null;
          created_at: string;
          currency: string;
          desired_by_date: string | null;
          estimated_minor: number;
          id: string;
          preferred_vendor_id: string | null;
          project_id: string;
          reason: string | null;
          requester_user_id: string;
          status: string;
          title: string;
        };
        Insert: {
          approved_at?: string | null;
          category_id?: string | null;
          created_at?: string;
          currency: string;
          desired_by_date?: string | null;
          estimated_minor: number;
          id?: string;
          preferred_vendor_id?: string | null;
          project_id: string;
          reason?: string | null;
          requester_user_id: string;
          status?: string;
          title: string;
        };
        Update: {
          approved_at?: string | null;
          category_id?: string | null;
          created_at?: string;
          currency?: string;
          desired_by_date?: string | null;
          estimated_minor?: number;
          id?: string;
          preferred_vendor_id?: string | null;
          project_id?: string;
          reason?: string | null;
          requester_user_id?: string;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_requests_category_id_project_id_fkey";
            columns: ["category_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchase_requests_preferred_vendor_id_project_id_fkey";
            columns: ["preferred_vendor_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchase_requests_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      purchases: {
        Row: {
          bill_id: string | null;
          category_id: string | null;
          corrects_event_id: string | null;
          created_at: string;
          created_by: string;
          currency: string;
          discount_minor: number;
          financial_event_id: string | null;
          id: string;
          invoice_number: string | null;
          linked_request_id: string | null;
          notes: string | null;
          payment_method: string | null;
          project_id: string;
          purchase_date: string;
          purchased_by_user_id: string;
          purpose: string | null;
          shipping_minor: number;
          status: string;
          subtotal_minor: number;
          tags: string[];
          tax_minor: number;
          total_minor: number;
          transaction_reference: string | null;
          vendor_id: string | null;
          version: number;
        };
        Insert: {
          bill_id?: string | null;
          category_id?: string | null;
          corrects_event_id?: string | null;
          created_at?: string;
          created_by: string;
          currency: string;
          discount_minor?: number;
          financial_event_id?: string | null;
          id?: string;
          invoice_number?: string | null;
          linked_request_id?: string | null;
          notes?: string | null;
          payment_method?: string | null;
          project_id: string;
          purchase_date?: string;
          purchased_by_user_id: string;
          purpose?: string | null;
          shipping_minor?: number;
          status?: string;
          subtotal_minor?: number;
          tags?: string[];
          tax_minor?: number;
          total_minor: number;
          transaction_reference?: string | null;
          vendor_id?: string | null;
          version?: number;
        };
        Update: {
          bill_id?: string | null;
          category_id?: string | null;
          corrects_event_id?: string | null;
          created_at?: string;
          created_by?: string;
          currency?: string;
          discount_minor?: number;
          financial_event_id?: string | null;
          id?: string;
          invoice_number?: string | null;
          linked_request_id?: string | null;
          notes?: string | null;
          payment_method?: string | null;
          project_id?: string;
          purchase_date?: string;
          purchased_by_user_id?: string;
          purpose?: string | null;
          shipping_minor?: number;
          status?: string;
          subtotal_minor?: number;
          tags?: string[];
          tax_minor?: number;
          total_minor?: number;
          transaction_reference?: string | null;
          vendor_id?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_bill_id_project_id_fkey";
            columns: ["bill_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "bills";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchases_category_id_project_id_fkey";
            columns: ["category_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchases_corrects_event_id_project_id_fkey";
            columns: ["corrects_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchases_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchases_linked_request_id_project_id_fkey";
            columns: ["linked_request_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchase_requests";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "purchases_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchases_vendor_id_project_id_fkey";
            columns: ["vendor_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      recurring_expense_templates: {
        Row: {
          active: boolean;
          amount_minor: number | null;
          category_id: string | null;
          currency: string;
          description: string;
          id: string;
          next_due_date: string;
          project_id: string;
          recurrence_rule: string;
          vendor_id: string | null;
        };
        Insert: {
          active?: boolean;
          amount_minor?: number | null;
          category_id?: string | null;
          currency: string;
          description: string;
          id?: string;
          next_due_date: string;
          project_id: string;
          recurrence_rule: string;
          vendor_id?: string | null;
        };
        Update: {
          active?: boolean;
          amount_minor?: number | null;
          category_id?: string | null;
          currency?: string;
          description?: string;
          id?: string;
          next_due_date?: string;
          project_id?: string;
          recurrence_rule?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_expense_templates_category_id_project_id_fkey";
            columns: ["category_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "recurring_expense_templates_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recurring_expense_templates_vendor_id_project_id_fkey";
            columns: ["vendor_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      refunds: {
        Row: {
          allocations: Json;
          amount_minor: number;
          bill_id: string | null;
          financial_event_id: string;
          id: string;
          project_id: string;
          purchase_id: string | null;
        };
        Insert: {
          allocations: Json;
          amount_minor: number;
          bill_id?: string | null;
          financial_event_id: string;
          id?: string;
          project_id: string;
          purchase_id?: string | null;
        };
        Update: {
          allocations?: Json;
          amount_minor?: number;
          bill_id?: string | null;
          financial_event_id?: string;
          id?: string;
          project_id?: string;
          purchase_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "refunds_bill_id_project_id_fkey";
            columns: ["bill_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "bills";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "refunds_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "refunds_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "refunds_purchase_id_project_id_fkey";
            columns: ["purchase_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchases";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      reimbursement_claim_items: {
        Row: {
          claimed_minor: number;
          id: string;
          project_id: string;
          purchase_funding_allocation_id: string;
          reimbursement_claim_id: string;
        };
        Insert: {
          claimed_minor: number;
          id?: string;
          project_id: string;
          purchase_funding_allocation_id: string;
          reimbursement_claim_id: string;
        };
        Update: {
          claimed_minor?: number;
          id?: string;
          project_id?: string;
          purchase_funding_allocation_id?: string;
          reimbursement_claim_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reimbursement_claim_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reimbursement_claim_items_purchase_funding_allocation_id_p_fkey";
            columns: ["purchase_funding_allocation_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchase_funding_allocations";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "reimbursement_claim_items_reimbursement_claim_id_project_i_fkey";
            columns: ["reimbursement_claim_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "reimbursement_claims";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      reimbursement_claims: {
        Row: {
          approved_at: string | null;
          approved_minor: number;
          claimant_user_id: string;
          created_at: string;
          currency: string;
          id: string;
          notes: string | null;
          project_id: string;
          requested_minor: number;
          status: string;
          submitted_at: string | null;
        };
        Insert: {
          approved_at?: string | null;
          approved_minor?: number;
          claimant_user_id: string;
          created_at?: string;
          currency: string;
          id?: string;
          notes?: string | null;
          project_id: string;
          requested_minor: number;
          status?: string;
          submitted_at?: string | null;
        };
        Update: {
          approved_at?: string | null;
          approved_minor?: number;
          claimant_user_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          notes?: string | null;
          project_id?: string;
          requested_minor?: number;
          status?: string;
          submitted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reimbursement_claims_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      reimbursement_payments: {
        Row: {
          amount_minor: number;
          financial_event_id: string;
          id: string;
          paid_at: string;
          paid_by_user_id: string;
          payment_method: string | null;
          project_account_id: string;
          project_id: string;
          reference: string | null;
          reimbursement_claim_id: string;
        };
        Insert: {
          amount_minor: number;
          financial_event_id: string;
          id?: string;
          paid_at?: string;
          paid_by_user_id: string;
          payment_method?: string | null;
          project_account_id: string;
          project_id: string;
          reference?: string | null;
          reimbursement_claim_id: string;
        };
        Update: {
          amount_minor?: number;
          financial_event_id?: string;
          id?: string;
          paid_at?: string;
          paid_by_user_id?: string;
          payment_method?: string | null;
          project_account_id?: string;
          project_id?: string;
          reference?: string | null;
          reimbursement_claim_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reimbursement_payments_financial_event_id_project_id_fkey";
            columns: ["financial_event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "reimbursement_payments_project_account_id_project_id_fkey";
            columns: ["project_account_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_accounts";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "reimbursement_payments_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reimbursement_payments_reimbursement_claim_id_project_id_fkey";
            columns: ["reimbursement_claim_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "reimbursement_claims";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      settlement_allocations: {
        Row: {
          amount_minor: number;
          event_id: string;
          id: string;
          kind: string;
          project_id: string;
          source_allocation_id: string;
        };
        Insert: {
          amount_minor: number;
          event_id: string;
          id?: string;
          kind: string;
          project_id: string;
          source_allocation_id: string;
        };
        Update: {
          amount_minor?: number;
          event_id?: string;
          id?: string;
          kind?: string;
          project_id?: string;
          source_allocation_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "settlement_allocations_event_id_project_id_fkey";
            columns: ["event_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "financial_events";
            referencedColumns: ["id", "project_id"];
          },
          {
            foreignKeyName: "settlement_allocations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "settlement_allocations_source_allocation_id_project_id_fkey";
            columns: ["source_allocation_id", "project_id"];
            isOneToOne: false;
            referencedRelation: "purchase_funding_allocations";
            referencedColumns: ["id", "project_id"];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          project_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          project_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tags_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      vendors: {
        Row: {
          address: string | null;
          contact_person: string | null;
          created_at: string;
          email: string | null;
          gstin: string | null;
          id: string;
          name: string;
          notes: string | null;
          phone: string | null;
          project_id: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          contact_person?: string | null;
          created_at?: string;
          email?: string | null;
          gstin?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          project_id: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          contact_person?: string | null;
          created_at?: string;
          email?: string | null;
          gstin?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          project_id?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vendors_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invite: { Args: { p_token: string }; Returns: string };
      begin_upload: {
        Args: {
          p_document_type: string;
          p_entity_id: string;
          p_entity_type: string;
          p_filename: string;
          p_mime: string;
          p_project: string;
          p_size: number;
        };
        Returns: Json;
      };
      change_member: {
        Args: {
          p_active?: boolean;
          p_project: string;
          p_role: Database["public"]["Enums"]["project_role"];
          p_user: string;
        };
        Returns: undefined;
      };
      close_project: {
        Args: { p_project: string; p_reason?: string };
        Returns: undefined;
      };
      closeout_checks: { Args: { p_project: string }; Returns: Json };
      create_project: {
        Args: {
          p_code: string;
          p_currency?: string;
          p_name: string;
          p_opening?: string;
        };
        Returns: string;
      };
      decide_approval: {
        Args: { p_comment?: string; p_decision: string; p_step: string };
        Returns: undefined;
      };
      delete_draft: {
        Args: { p_id: string; p_project: string; p_table: string };
        Returns: undefined;
      };
      finance_issues: { Args: { p_project: string }; Returns: Json };
      finish_upload: { Args: { p_id: string }; Returns: undefined };
      generate_recurring_drafts: {
        Args: { p_project: string };
        Returns: number;
      };
      invite_member: {
        Args: {
          p_email: string;
          p_project: string;
          p_role: Database["public"]["Enums"]["project_role"];
        };
        Returns: string;
      };
      member_entitlements: { Args: { p_project: string }; Returns: Json };
      post_financial: {
        Args: { p_command: Json; p_project: string };
        Returns: string;
      };
      prepare_advance_topup: {
        Args: {
          p_advance: string;
          p_amount: string;
          p_project: string;
          p_reason: string;
        };
        Returns: undefined;
      };
      project_analytics: { Args: { p_project: string }; Returns: Json };
      project_records: {
        Args: {
          p_desc?: boolean;
          p_filters?: Json;
          p_limit?: number;
          p_offset?: number;
          p_order?: string;
          p_project: string;
          p_search?: string;
          p_table: string;
        };
        Returns: Json;
      };
      project_summary: { Args: { p_project: string }; Returns: Json };
      record_position: {
        Args: { p_id: string; p_project: string; p_table: string };
        Returns: Json;
      };
      refresh_reminders: { Args: { p_project: string }; Returns: undefined };
      report_data: {
        Args: {
          p_filters?: Json;
          p_from?: string;
          p_project: string;
          p_report: string;
          p_to?: string;
        };
        Returns: Json;
      };
      revoke_invite: {
        Args: { p_id: string; p_project: string };
        Returns: undefined;
      };
      save_generated: {
        Args: {
          p_entity_id: string;
          p_entity_type: string;
          p_html: string;
          p_project: string;
          p_snapshot: Json;
          p_template: string;
        };
        Returns: string;
      };
      save_purchase: {
        Args: { p_data: Json; p_project: string };
        Returns: string;
      };
      save_record: {
        Args: { p_data: Json; p_project: string; p_table: string };
        Returns: string;
      };
      search_records: {
        Args: { p_project?: string; p_query: string };
        Returns: Json;
      };
      set_project_status: {
        Args: { p_project: string; p_reason?: string; p_status: string };
        Returns: undefined;
      };
      submit_approval: {
        Args: { p_id: string; p_project: string; p_table: string };
        Returns: string;
      };
      transfer_owner: {
        Args: { p_project: string; p_user: string };
        Returns: undefined;
      };
      update_record: {
        Args: {
          p_data: Json;
          p_id: string;
          p_project: string;
          p_table: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      project_role:
        | "OWNER"
        | "ADMIN"
        | "FINANCE_MANAGER"
        | "APPROVER"
        | "MEMBER"
        | "VIEWER";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      project_role: [
        "OWNER",
        "ADMIN",
        "FINANCE_MANAGER",
        "APPROVER",
        "MEMBER",
        "VIEWER",
      ],
    },
  },
} as const;
