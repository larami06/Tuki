-- ============================================================
-- TUKI — Script de Correção: Avatar Padrão no Inventário
-- Versão: 1.0
-- Data: 2026-05-29
--
-- PROBLEMA: Usuários criados antes desta correção têm o avatar
-- padrão (ex: avatar_1) salvo apenas na coluna usuario.avatar,
-- mas nunca foram inseridos em usuario_recompensa. Por isso,
-- ao comprar um novo avatar, o avatar original "sumia" do
-- inventário.
--
-- SOLUÇÃO: Para cada usuário, inserir sua recompensa de avatar
-- padrão em usuario_recompensa (se ainda não existir).
--
-- INSTRUÇÃO: Execute este script UMA VEZ no banco de dados
-- de produção/desenvolvimento antes de publicar a correção.
-- ============================================================

-- 1. Visualizar usuários afetados (sem avatar padrão no inventário)
SELECT
    u.idusuario,
    u.nick,
    u.avatar AS avatar_padrao,
    r.idrecompensa,
    r.nome AS nome_recompensa
FROM usuario u
JOIN recompensa r
    ON r.identificador = u.avatar
    AND r.tipo = 'avatar'
LEFT JOIN usuario_recompensa ur
    ON ur.idusuario = u.idusuario
    AND ur.idrecompensa = r.idrecompensa
WHERE ur.idusuario IS NULL
ORDER BY u.idusuario;

-- 2. Inserir avatar padrão para todos os usuários afetados
INSERT INTO usuario_recompensa (idusuario, idrecompensa)
SELECT
    u.idusuario,
    r.idrecompensa
FROM usuario u
JOIN recompensa r
    ON r.identificador = u.avatar
    AND r.tipo = 'avatar'
LEFT JOIN usuario_recompensa ur
    ON ur.idusuario = u.idusuario
    AND ur.idrecompensa = r.idrecompensa
WHERE ur.idusuario IS NULL;

-- 3. Verificar resultado (deve retornar 0 após a correção)
SELECT COUNT(*) AS usuarios_sem_avatar_padrao
FROM usuario u
JOIN recompensa r
    ON r.identificador = u.avatar
    AND r.tipo = 'avatar'
LEFT JOIN usuario_recompensa ur
    ON ur.idusuario = u.idusuario
    AND ur.idrecompensa = r.idrecompensa
WHERE ur.idusuario IS NULL;
