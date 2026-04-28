using Microsoft.AspNetCore.Mvc;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;

namespace TUKI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventariosController : ControllerBase
{
    private readonly IInventarioService _service;

    public InventariosController(IInventarioService service)
    {
        _service = service;
    }

    [HttpGet("usuario/{idUsuario}")]
    public async Task<ActionResult<InventarioResponseDto>> GetByUsuario(int idUsuario)
    {
        var inventario = await _service.GetByUsuarioIdAsync(idUsuario);
        if (inventario == null) return NotFound();
        return Ok(inventario);
    }

    [HttpPut("usuario/{idUsuario}")]
    public async Task<IActionResult> Update(int idUsuario, InventarioUpdateDto dto)
    {
        try
        {
            await _service.UpdateAsync(idUsuario, dto);
            return NoContent();
        }
        catch (KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }
    }
}
