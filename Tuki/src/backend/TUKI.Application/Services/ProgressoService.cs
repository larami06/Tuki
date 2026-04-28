using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;

namespace TUKI.Application.Services;

public class ProgressoService : IProgressoService
{
    private readonly IProgressoRepository _repository;
    private readonly IMapper _mapper;

    public ProgressoService(IProgressoRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProgressoResponseDto>> GetByUsuarioAsync(int idUsuario)
        => _mapper.Map<IEnumerable<ProgressoResponseDto>>(await _repository.GetByUsuarioAsync(idUsuario));

    public async Task<ProgressoResponseDto?> GetByIdAsync(int id)
        => _mapper.Map<ProgressoResponseDto?>(await _repository.GetByIdAsync(id));

    public async Task<ProgressoResponseDto> RegistrarAsync(ProgressoCreateDto dto)
    {
        var existente = await _repository.GetByUsuarioELicaoAsync(dto.IdUsuario, dto.IdLicao);
        if (existente != null)
        {
            _mapper.Map(dto, existente);
            await _repository.UpdateAsync(existente);
            return _mapper.Map<ProgressoResponseDto>(existente);
        }
        var progresso = _mapper.Map<Progresso>(dto);
        await _repository.AddAsync(progresso);
        return _mapper.Map<ProgressoResponseDto>(progresso);
    }

    public async Task UpdateAsync(int id, ProgressoCreateDto dto)
    {
        var progresso = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Progresso {id} não encontrado.");
        _mapper.Map(dto, progresso);
        await _repository.UpdateAsync(progresso);
    }
}
