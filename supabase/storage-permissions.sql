-- Criar um bucket para armazenar as fotos de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('perfil-fotos', 'perfil-fotos', true);

-- Política de armazenamento: Qualquer pessoa pode fazer upload
CREATE POLICY "Upload público para fotos" 
ON storage.objects FOR INSERT 
TO public
USING (bucket_id = 'perfil-fotos');

-- Política de armazenamento: Qualquer pessoa pode visualizar as fotos
CREATE POLICY "Visualização pública das fotos" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'perfil-fotos');

-- Política de armazenamento: Qualquer pessoa pode atualizar fotos
CREATE POLICY "Atualização pública das fotos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'perfil-fotos');

-- Política de armazenamento: Qualquer pessoa pode excluir fotos
CREATE POLICY "Exclusão pública das fotos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'perfil-fotos');
