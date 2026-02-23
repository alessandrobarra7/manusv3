import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  getStudiesByUnitId,
  getStudyById,
  getTemplatesByUnitId,
  getGlobalTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getReportByStudyId,
  createReport,
  updateReport,
  createAuditLog,
  getDb,
} from "./db";
import { units } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  units: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === 'admin_master') {
        return await getAllUnits();
      }
      if (ctx.user.unit_id) {
        const unit = await getUnitById(ctx.user.unit_id);
        return unit ? [unit] : [];
      }
      return [];
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const unit = await getUnitById(input.id);
        if (!unit) throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
        
        if (ctx.user.role !== 'admin_master' && ctx.user.unit_id !== unit.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        return unit;
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        orthanc_base_url: z.string().optional(),
        orthanc_basic_user: z.string().optional(),
        orthanc_basic_pass: z.string().optional(),
        logoUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createUnit(input);
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: id,
          action: 'CREATE_UNIT',
          target_type: 'UNIT',
          target_id: String(id),
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        orthanc_base_url: z.string().optional(),
        orthanc_basic_user: z.string().optional(),
        orthanc_basic_pass: z.string().optional(),
        logoUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        
        if (ctx.user.role !== 'admin_master' && ctx.user.unit_id !== id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        await updateUnit(id, data);
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: id,
          action: 'UPDATE_UNIT',
          target_type: 'UNIT',
          target_id: String(id),
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteUnit(input.id);
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: input.id,
          action: 'DELETE_UNIT',
          target_type: 'UNIT',
          target_id: String(input.id),
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        return { success: true };
      }),
  }),

  studies: router({
    list: protectedProcedure
      .input(z.object({
        patient_name: z.string().optional(),
        modality: z.string().optional(),
        study_date: z.string().optional(),
        accession_number: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user.unit_id && ctx.user.role !== 'admin_master') {
          return { items: [], total: 0, page: input.page, pageSize: input.pageSize };
        }
        
        const unitId = ctx.user.unit_id || 0;
        const offset = (input.page - 1) * input.pageSize;
        
        const studies = await getStudiesByUnitId(unitId, {
          patient_name: input.patient_name,
          modality: input.modality,
          study_date: input.study_date,
          accession_number: input.accession_number,
          limit: input.pageSize,
          offset,
        });
        
        return {
          items: studies,
          total: studies.length,
          page: input.page,
          pageSize: input.pageSize,
        };
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const unitId = ctx.user.role === 'admin_master' ? undefined : (ctx.user.unit_id ?? undefined);
        const study = await getStudyById(input.id, unitId);
        
        if (!study) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Study not found' });
        }
        
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: study.unit_id,
          action: 'VIEW_STUDY',
          target_type: 'STUDY',
          target_id: String(study.id),
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        
        return study;
      }),
    
    openViewer: protectedProcedure
      .input(z.object({ studyId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const unitId = ctx.user.role === 'admin_master' ? undefined : (ctx.user.unit_id ?? undefined);
        const study = await getStudyById(input.studyId, unitId);
        
        if (!study) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Study not found' });
        }
        
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: study.unit_id,
          action: 'OPEN_VIEWER',
          target_type: 'STUDY',
          target_id: String(study.id),
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        
        const unit = await getUnitById(study.unit_id);
        return {
          viewerUrl: `/viewer/${study.id}`,
          studyInstanceUid: study.study_instance_uid,
          unitSlug: unit?.slug,
        };
      }),
  }),

  templates: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === 'admin_master') {
        return await getGlobalTemplates();
      }
      if (ctx.user.unit_id) {
        return await getTemplatesByUnitId(ctx.user.unit_id);
      }
      return [];
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const template = await getTemplateById(input.id);
        if (!template) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
        }
        return template;
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        modality: z.string().optional(),
        bodyTemplate: z.string(),
        fields: z.any().optional(),
        isGlobal: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.isGlobal && ctx.user.role !== 'admin_master') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admin_master can create global templates' });
        }
        
        const id = await createTemplate({
          ...input,
          unit_id: input.isGlobal ? null : ctx.user.unit_id,
          createdBy: ctx.user.id,
        });
        
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        modality: z.string().optional(),
        bodyTemplate: z.string().optional(),
        fields: z.any().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTemplate(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTemplate(input.id);
        return { success: true };
      }),
  }),

  reports: router({
    getByStudyId: protectedProcedure
      .input(z.object({ studyId: z.number() }))
      .query(async ({ input, ctx }) => {
        const unitId = ctx.user.role === 'admin_master' ? undefined : (ctx.user.unit_id ?? undefined);
        return await getReportByStudyId(input.studyId, unitId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        study_id: z.number(),
        study_instance_uid: z.string().optional(),
        template_id: z.number().optional(),
        body: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.unit_id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'User must be assigned to a unit' });
        }
        
        const id = await createReport({
          ...input,
          unit_id: ctx.user.unit_id,
          author_user_id: ctx.user.id,
          status: 'draft',
        });
        
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: ctx.user.unit_id,
          action: 'CREATE_REPORT',
          target_type: 'REPORT',
          target_id: String(id),
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        body: z.string().optional(),
        status: z.enum(['draft', 'signed', 'revised']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await updateReport(id, data);
        
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: ctx.user.unit_id,
          action: 'UPDATE_REPORT',
          target_type: 'REPORT',
          target_id: String(id),
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        
        return { success: true };
      }),
    
    sign: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await updateReport(input.id, {
          status: 'signed',
          signedAt: new Date(),
          signedBy: ctx.user.id,
        });
        
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: ctx.user.unit_id,
          action: 'SIGN_REPORT',
          target_type: 'REPORT',
          target_id: String(input.id),
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        
        return { success: true };
      }),
  }),

  pacs: router({
    query: protectedProcedure
      .input(z.object({
        patientName: z.string().optional(),
        patientId: z.string().optional(),
        modality: z.string().optional(),
        studyDate: z.string().optional(),
        accessionNumber: z.string().optional(),
        studyDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get user's unit to retrieve PACS connection parameters
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database not available',
          });
        }
        
        const [unit] = await db.select().from(units).where(eq(units.id, ctx.user.unit_id!)).limit(1);
        
        if (!unit) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Unidade não encontrada',
          });
        }
        
        // Check if PACS connection is configured
        if (!unit.pacs_ip || !unit.pacs_port || !unit.pacs_ae_title) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'PACS não configurado para esta unidade. Configure IP, porta e AE Title.',
          });
        }
        
        // Prepare input for Python script
        const queryInput = {
          pacs_ip: unit.pacs_ip,
          pacs_port: unit.pacs_port,
          pacs_ae_title: unit.pacs_ae_title,
          local_ae_title: unit.pacs_local_ae_title || 'PACSMANUS',
          filters: {
            patient_name: input.patientName,
            patient_id: input.patientId,
            modality: input.modality,
            study_date: input.studyDate,
            accession_number: input.accessionNumber,
          },
        };
        
        // Execute Python script
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        try {
          const scriptPath = new URL('./dicom_query.sh', import.meta.url).pathname;
          const { stdout, stderr } = await execAsync(
            `"${scriptPath}" '${JSON.stringify(queryInput)}'`,
            { timeout: 30000 } // 30 second timeout
          );
          
          if (stderr) {
            console.error('Python script stderr:', stderr);
          }
          
          const result = JSON.parse(stdout);
          
          // Log audit
          await createAuditLog({
            user_id: ctx.user.id,
            unit_id: ctx.user.unit_id,
            action: 'PACS_QUERY',
            target_type: 'PACS',
            target_id: unit.pacs_ae_title,
            ip_address: ctx.req.ip,
            user_agent: ctx.req.headers['user-agent'],
            metadata: {
              ...input,
              pacs_ip: unit.pacs_ip,
              results_count: result.count || 0,
            },
          });
          
          if (!result.success) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Erro ao consultar PACS: ${result.error}`,
              cause: result.details,
            });
          }
          
          return {
            success: true,
            studies: result.studies || [],
            count: result.count || 0,
          };
          
        } catch (error: any) {
          console.error('Error executing DICOM query:', error);
          
          // Log failed audit
          await createAuditLog({
            user_id: ctx.user.id,
            unit_id: ctx.user.unit_id,
            action: 'PACS_QUERY',
            target_type: 'PACS',
            target_id: unit.pacs_ae_title,
            ip_address: ctx.req.ip,
            user_agent: ctx.req.headers['user-agent'],
            metadata: {
              ...input,
              error: error.message,
            },
          });
          
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Falha na consulta DICOM: ${error.message}`,
          });
        }
      }),
    
    download: protectedProcedure
      .input(z.object({
        studyInstanceUid: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // TODO: Implement C-MOVE to download study from remote PACS to local Orthanc
        
        await createAuditLog({
          user_id: ctx.user.id,
          unit_id: ctx.user.unit_id,
          action: 'PACS_DOWNLOAD',
          target_type: 'STUDY',
          target_id: input.studyInstanceUid,
          ip_address: ctx.req.ip,
          user_agent: ctx.req.headers['user-agent'],
        });
        
        return {
          success: true,
          message: 'Download iniciado',
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
