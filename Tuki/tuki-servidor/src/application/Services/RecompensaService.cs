using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;

namespace TUKI.Application.Services;

public class RecompensaService : IRecompensaService
{
    private readonly IRecompensaRepository _repository;
    private readonly IMapper _mapper;

    public RecompensaService(IRecompensaRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<RecompensaResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<RecompensaResponseDto>>(await _repository.GetAllAsync());

    public async Task<RecompensaResponseDto?> GetByIdAsync(int id)
        => _mapper.Map<RecompensaResponseDto?>(await _repository.GetByIdAsync(id));

    public async Task<RecompensaResponseDto> AddAsync(RecompensaCreateDto dto)
    {
        var recompensa = _mapper.Map<Recompensa>(dto);
        await _repository.AddAsync(recompensa);
        return _mapper.Map<RecompensaResponseDto>(recompensa);
    }

    public async Task UpdateAsync(int id, RecompensaCreateDto dto)
    {
        var recompensa = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Recompensa {id} não encontrada.");
        _mapper.Map(dto, recompensa);
        await _repository.UpdateAsync(recompensa);
    }

    public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
}
