using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;

namespace TUKI.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _repository;
    private readonly IInventarioRepository _inventarioRepository;
    private readonly IMapper _mapper;

    public UsuarioService(IUsuarioRepository repository, IInventarioRepository inventarioRepository, IMapper mapper)
    {
        _repository = repository;
        _inventarioRepository = inventarioRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UsuarioResponseDto>> GetAllAsync()
    {
        var usuarios = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<UsuarioResponseDto>>(usuarios);
    }

    public async Task<UsuarioResponseDto?> GetByIdAsync(int id)
    {
        var usuario = await _repository.GetByIdAsync(id);
        return _mapper.Map<UsuarioResponseDto?>(usuario);
    }

    public async Task<UsuarioResponseDto> AddAsync(UsuarioCreateDto dto)
    {
        var usuario = _mapper.Map<Usuario>(dto);
        await _repository.AddAsync(usuario);
        await _inventarioRepository.AddAsync(new Inventario { IdUsuario = usuario.IdUsuario });
        return _mapper.Map<UsuarioResponseDto>(usuario);
    }

    public async Task<IEnumerable<UsuarioResponseDto>> GetByResponsavelIdAsync(int responsavelId)
    {
        var usuarios = await _repository.GetByResponsavelIdAsync(responsavelId);
        return _mapper.Map<IEnumerable<UsuarioResponseDto>>(usuarios);
    }
}
