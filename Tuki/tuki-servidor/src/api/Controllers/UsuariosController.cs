using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        try
        {
            var result = await _usuarioService.AddAsync(createDto);
            return CreatedAtAction(nameof(GetUsuario), new { id = result.Id }, result);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("23505") == true)
        {
            return Conflict(new { message = "Já existe um perfil com esse nome." });
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("23503") == true)
        {
            return BadRequest(new { message = "Responsável não encontrado." });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UsuarioResponseDto>> Update(int id, UsuarioUpdateDto dto)
    {
        var result = await _usuarioService.UpdateAsync(id, dto);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{id}/recompensas")]
    public async Task<ActionResult<IEnumerable<RecompensaResponseDto>>> GetRecompensas(int id)
    {
        var result = await _usuarioService.GetRecompensasAsync(id);
        return Ok(result);
    }
}
