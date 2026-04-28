using Microsoft.AspNetCore.Mvc;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;

namespace TUKI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressosController : ControllerBase
{
    private readonly IProgressoService _service;

    public ProgressosController(IProgressoService service)
    {
        _service = service;
    }

    [HttpGet("usuario/{idUsuario}")]
    public async Task<ActionResult<IEnumerable<ProgressoResponseDto>>> GetByUsuario(int idUsuario)
        => Ok(await _service.GetByUsuarioAsync(idUsuario));

    [HttpGet("{id}")]
    public async Task<ActionResult<ProgressoResponseDto>> GetById(int id)
    {
        var progresso = await _service.GetByIdAsync(id);
        if (progresso == null) return NotFound();
        return Ok(progresso);
    }

    [HttpPost]
    public async Task<ActionResult<ProgressoResponseDto>> Registrar(ProgressoCreateDto dto)
    {
        var result = await _service.RegistrarAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ProgressoCreateDto dto)
    {
        try
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }
    }
}
