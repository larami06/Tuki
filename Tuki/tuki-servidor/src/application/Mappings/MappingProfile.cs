using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Domain.Entities;

namespace TUKI.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Usuario, UsuarioResponseDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.IdUsuario))
            .ForMember(dest => dest.Moedas, opt => opt.MapFrom(src => src.Inventario != null ? src.Inventario.Moedas : 0))
            .ForMember(dest => dest.Estrelas, opt => opt.MapFrom(src => src.Inventario != null ? src.Inventario.Estrelas : 0))
            .ForMember(dest => dest.LicoesConcluidas, opt => opt.MapFrom(src => src.Inventario != null ? src.Inventario.LicoesConcluidas : 0))
            .ForMember(dest => dest.StreakAtual, opt => opt.MapFrom(src => src.Inventario != null ? src.Inventario.StreakAtual : 0));
        CreateMap<UsuarioCreateDto, Usuario>();

        CreateMap<Responsavel, ResponsavelResponseDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.IdResponsavel));

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
