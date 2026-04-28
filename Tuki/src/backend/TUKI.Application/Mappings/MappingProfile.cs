using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Domain.Entities;

namespace TUKI.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Usuario, UsuarioResponseDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.IdUsuario));
        CreateMap<UsuarioCreateDto, Usuario>();

        CreateMap<Inventario, InventarioResponseDto>();

        CreateMap<Recompensa, RecompensaResponseDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.IdRecompensa));
        CreateMap<RecompensaCreateDto, Recompensa>();

        CreateMap<Licao, LicaoResponseDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.IdLicao));
        CreateMap<LicaoCreateDto, Licao>();

        CreateMap<Progresso, ProgressoResponseDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.IdProgresso));
        CreateMap<ProgressoCreateDto, Progresso>();
    }
}
