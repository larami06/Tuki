using Microsoft.AspNetCore.Mvc;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;

namespace TUKI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResponsaveisController : ControllerBase
{
    private readonly IResponsavelService _service;

    public ResponsaveisController(IResponsavelService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponsavelResponseDto>> GetById(int id)
    {
        var responsavel = await _service.GetByIdAsync(id);
        if (responsavel == null) return NotFound();
        return Ok(responsavel);
    }

    [HttpPost]
    public async Task<ActionResult<ResponsavelResponseDto>> Create(ResponsavelCreateDto dto)
    {
        var result = await _service.AddAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
    [HttpPost("login")]
    public async Task<ActionResult<ResponsavelResponseDto>> Login(LoginDto dto)
    {
        var result = await _service.LoginAsync(dto);
        if (result == null)
            return Unauthorized(new { message = "Email ou senha inválidos." });
        
        return Ok(result);
    }
}
