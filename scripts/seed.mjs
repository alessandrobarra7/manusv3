import { drizzle } from "drizzle-orm/mysql2";
import { units, studies_cache, templates } from "../drizzle/schema.ts";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Criar unidades de exemplo
    console.log("📍 Criando unidades médicas...");
    
    const [unit1] = await db.insert(units).values({
      name: "Unidade Central",
      slug: "unidade-central",
      isActive: true,
      orthanc_base_url: "http://192.168.3.250:8042",
      orthanc_basic_user: "orthanc",
      orthanc_basic_pass: "orthanc",
    });

    const [unit2] = await db.insert(units).values({
      name: "Unidade Norte",
      slug: "unidade-norte",
      isActive: true,
      orthanc_base_url: "http://192.168.3.251:8042",
    });

    console.log(`✅ Unidades criadas: ${unit1.insertId}, ${unit2.insertId}`);

    // Criar templates de exemplo
    console.log("📝 Criando templates de laudos...");
    
    await db.insert(templates).values([
      {
        name: "Raio-X de Tórax PA",
        modality: "CR",
        bodyTemplate: `RAIO-X DE TÓRAX PA

TÉCNICA: Radiografia simples do tórax em incidência póstero-anterior.

ACHADOS:
- Campos pulmonares: [Descrever achados]
- Silhueta cardíaca: [Descrever tamanho e contornos]
- Mediastino: [Descrever]
- Estruturas ósseas: [Descrever]
- Partes moles: [Descrever]

IMPRESSÃO:
[Conclusão diagnóstica]

Radiologista: {radiologist_name}
Data: {report_date}`,
        isGlobal: true,
        isActive: true,
      },
      {
        name: "Tomografia de Crânio",
        modality: "CT",
        bodyTemplate: `TOMOGRAFIA COMPUTADORIZADA DE CRÂNIO

TÉCNICA: Exame realizado sem contraste endovenoso.

ACHADOS:
- Parênquima encefálico: [Descrever]
- Sistema ventricular: [Descrever]
- Espaços liquóricos: [Descrever]
- Estruturas ósseas: [Descrever]
- Seios paranasais: [Descrever]

IMPRESSÃO:
[Conclusão diagnóstica]

Radiologista: {radiologist_name}
Data: {report_date}`,
        isGlobal: true,
        isActive: true,
      },
      {
        name: "Ultrassonografia Abdominal",
        modality: "US",
        bodyTemplate: `ULTRASSONOGRAFIA DE ABDOME TOTAL

TÉCNICA: Exame realizado com transdutor convexo multifrequencial.

ACHADOS:
- Fígado: [Descrever dimensões, ecotextura e lesões]
- Vesícula biliar: [Descrever]
- Vias biliares: [Descrever]
- Pâncreas: [Descrever quando visível]
- Baço: [Descrever]
- Rins: [Descrever ambos]
- Bexiga: [Descrever]
- Alças intestinais: [Descrever]
- Líquido livre: [Ausente/Presente]

IMPRESSÃO:
[Conclusão diagnóstica]

Radiologista: {radiologist_name}
Data: {report_date}`,
        isGlobal: true,
        isActive: true,
      },
    ]);

    console.log("✅ Templates criados com sucesso!");

    // Criar estudos mock para demonstração
    console.log("🔬 Criando estudos DICOM de exemplo...");
    
    await db.insert(studies_cache).values([
      {
        unit_id: Number(unit1.insertId),
        orthanc_study_id: "mock-study-001",
        study_instance_uid: "1.2.840.113619.2.1.1.1.1.20240101.001",
        patient_name: "SILVA, JOÃO",
        patient_id: "12345678",
        accession_number: "ACC001",
        study_date: new Date("2024-01-15"),
        modality: "CR",
        description: "RAIO-X DE TÓRAX PA",
      },
      {
        unit_id: Number(unit1.insertId),
        orthanc_study_id: "mock-study-002",
        study_instance_uid: "1.2.840.113619.2.1.1.1.1.20240102.002",
        patient_name: "SANTOS, MARIA",
        patient_id: "87654321",
        accession_number: "ACC002",
        study_date: new Date("2024-01-16"),
        modality: "CT",
        description: "TOMOGRAFIA DE CRÂNIO SEM CONTRASTE",
      },
      {
        unit_id: Number(unit2.insertId),
        orthanc_study_id: "mock-study-003",
        study_instance_uid: "1.2.840.113619.2.1.1.1.1.20240103.003",
        patient_name: "OLIVEIRA, PEDRO",
        patient_id: "11223344",
        accession_number: "ACC003",
        study_date: new Date("2024-01-17"),
        modality: "US",
        description: "ULTRASSONOGRAFIA ABDOMINAL TOTAL",
      },
    ]);

    console.log("✅ Estudos mock criados com sucesso!");

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("\n📊 Resumo:");
    console.log("   - 2 unidades médicas");
    console.log("   - 3 templates de laudos");
    console.log("   - 3 estudos DICOM de exemplo");
    
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
