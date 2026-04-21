using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Domain.Entities;

namespace TUKI.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Usuario, UsuarioResponseDto>();
        CreateMap<UsuarioCreateDto, Usuario>();
    }
}
