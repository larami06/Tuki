using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;

namespace TUKI.Application.Services;

public class ProgressoService : IProgressoService
{
    private readonly IProgressoRepository _repository;
    private readonly IInventarioRepository _inventarioRepository;
    private readonly IMapper _mapper;

    public ProgressoService(IProgressoRepository repository, IInventarioRepository inventarioRepository, IMapper mapper)
    {
        _repository = repository;
        _inventarioRepository = inventarioRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProgressoResponseDto>> GetByUsuarioAsync(int idUsuario)
        => _mapper.Map<IEnumerable<ProgressoResponseDto>>(await _repository.GetByUsuarioAsync(idUsuario));

    public async Task<ProgressoResponseDto?> GetByIdAsync(int id)
        => _mapper.Map<ProgressoResponseDto?>(await _repository.GetByIdAsync(id));

    public async Task<ProgressoResponseDto> RegistrarAsync(ProgressoCreateDto dto)
    {
        var existente = await _repository.GetByUsuarioELicaoAsync(dto.IdUsuario, dto.IdLicao);
        bool isFirstCompletion = false;

        if (existente != null)
        {
            if (!existente.Concluida && dto.Concluida)
            {
                isFirstCompletion = true;
            }
            _mapper.Map(dto, existente);
            await _repository.UpdateAsync(existente);

            if (dto.Concluida)
            {
                await AtualizarInventarioUsuario(dto.IdUsuario, dto.Concluida, dto.Pontuacao, isFirstCompletion);
            }

            return _mapper.Map<ProgressoResponseDto>(existente);
        }

        var progresso = _mapper.Map<Progresso>(dto);
        await _repository.AddAsync(progresso);

        if (dto.Concluida)
        {
            await AtualizarInventarioUsuario(dto.IdUsuario, true, dto.Pontuacao, true);
        }

        return _mapper.Map<ProgressoResponseDto>(progresso);
    }

    public async Task UpdateAsync(int id, ProgressoCreateDto dto)
    {
        var progresso = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Progresso {id} não encontrado.");
        
        bool wasConcluded = progresso.Concluida;
        _mapper.Map(dto, progresso);
        await _repository.UpdateAsync(progresso);

        if (progresso.Concluida)
        {
            await AtualizarInventarioUsuario(dto.IdUsuario, true, dto.Pontuacao, !wasConcluded);
        }
    }

    private async Task AtualizarInventarioUsuario(int idUsuario, bool concluida, decimal? pontuacao, bool isFirstCompletion)
    {
        if (!concluida) return;

        var inventario = await _inventarioRepository.GetByUsuarioIdAsync(idUsuario);
        if (inventario == null)
        {
            inventario = new Inventario 
            { 
                IdUsuario = idUsuario, 
                Moedas = 0, 
                Estrelas = 0, 
                LicoesConcluidas = 0, 
                XP = 0 
            };
            await _inventarioRepository.AddAsync(inventario);
        }

        // 1. Aumentar Lições Concluídas apenas na primeira vez
        if (isFirstCompletion)
        {
            inventario.LicoesConcluidas += 1;
        }

        // 2. Aumentar Estrelas e Moedas
        int estrelasGanhas = 3;
        int moedasGanhas = 10;

        if (pontuacao.HasValue)
        {
            // Cada acerto dá 3 estrelas e 5 moedas
            estrelasGanhas = (int)pontuacao.Value * 3;
            moedasGanhas = (int)pontuacao.Value * 5;
        }

        inventario.Estrelas += estrelasGanhas;
        inventario.Moedas += moedasGanhas;

        // 3. Atualizar Streak (Ofensiva diária)
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        if (inventario.UltimaAtividade == null)
        {
            inventario.StreakAtual = 1;
        }
        else
        {
            var ontem = hoje.AddDays(-1);
            if (inventario.UltimaAtividade == ontem)
            {
                inventario.StreakAtual += 1;
            }
            else if (inventario.UltimaAtividade < ontem)
            {
                inventario.StreakAtual = 1;
            }
        }
        inventario.UltimaAtividade = hoje;

        await _inventarioRepository.UpdateAsync(inventario);
    }
}
