using Microsoft.AspNetCore.Mvc;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;

namespace TUKI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioResponseDto>>> GetUsuarios()
    {
        var usuarios = await _usuarioService.GetAllAsync();
        return Ok(usuarios);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioResponseDto>> GetUsuario(int id)
    {
        var usuario = await _usuarioService.GetByIdAsync(id);
        if (usuario == null) return NotFound();
        return Ok(usuario);
    }

    [HttpGet("responsavel/{responsavelId}")]
    public async Task<ActionResult<IEnumerable<UsuarioResponseDto>>> GetByResponsavel(int responsavelId)
    {
        var result = await _usuarioService.GetByResponsavelIdAsync(responsavelId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioResponseDto>> CreateUsuario(UsuarioCreateDto createDto)
    {
        var result = await _usuarioService.AddAsync(createDto);
        return CreatedAtAction(nameof(GetUsuario), new { id = result.Id }, result);
    }
}
